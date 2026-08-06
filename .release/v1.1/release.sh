#!/usr/bin/env bash
# ==============================================================================
# Enterprise Institutional Release Automation Script (Bash)
# ==============================================================================
set -euo pipefail

DRY_RUN=false
REMOTE_NAME="Clasptek.ai"
RELEASE_BRANCH="release/v1.1"
TARGET_BRANCH="master"
VERSION="1.1.0"

if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MANIFEST_DIR="$SCRIPT_DIR/manifests"
LOGS_DIR="$SCRIPT_DIR/logs"
ARTIFACTS_DIR="$SCRIPT_DIR/artifacts/v$VERSION"
REPORTS_DIR="$SCRIPT_DIR/reports"
DOCS_RELEASE_DIR="$WORKSPACE_ROOT/docs/releases"

echo "========================================================"
echo "  STARTING INSTITUTIONAL RELEASE 1.1 AUTOMATION PIPELINE (BASH)"
echo "========================================================"
if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN MODE ENABLED - No changes will be committed or pushed."
fi

mkdir -p "$MANIFEST_DIR" "$LOGS_DIR" "$ARTIFACTS_DIR" "$REPORTS_DIR" "$DOCS_RELEASE_DIR"

clean_rollback() {
    local committed_in_step="$1"
    echo -e "\n========================================================"
    echo "  AUTOMATIC FAIL-SAFE ROLLBACK TRIGGERED"
    echo "========================================================"
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would execute git reset --hard and git clean -fd"
        return 0
    fi
    if [ "$committed_in_step" = true ]; then
        echo "Reverting last commit (git reset --hard HEAD~1)..."
        git reset --hard HEAD~1 || true
    else
        echo "Cleaning working tree (git reset --hard)..."
        git reset --hard || true
    fi
    git clean -fd || true
    echo "✔ Repository restored to clean state."
}

run_step() {
    local cmd="$1"
    local desc="$2"
    local log_file="${3:-}"

    echo -e "\n--> Running: $desc ($cmd)..."
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would execute: $cmd"
        return 0
    fi
    if [ -n "$log_file" ]; then
        eval "$cmd" > "$log_file" 2>&1
    else
        eval "$cmd"
    fi
    echo "✔ $desc completed."
}

verify_manifest_commit_match() {
    local manifest_path="$1"
    local step_title="$2"

    echo "Verifying committed files match manifest exactly..."
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would compare git diff-tree HEAD with $manifest_path."
        return 0
    fi

    local expected
    expected=$(grep -v '^#' "$manifest_path" | grep -v '^$' | sort)
    local actual
    actual=$(git diff-tree --no-commit-id --name-only -r HEAD | sort)

    if [ "$expected" != "$actual" ]; then
        echo "✖ MANIFEST MISMATCH DETECTED FOR $step_title!"
        diff -u <(echo "$expected") <(echo "$actual") || true
        exit 1
    fi
    echo "✔ Manifest exact match verified."
}

wait_for_ci() {
    local commit_hash="$1"
    echo -e "\nVerifying GitHub Actions CI and Vercel Preview for commit $commit_hash on $RELEASE_BRANCH..."
    if [ "$DRY_RUN" = true ]; then
        echo "[DRY-RUN] Would poll GitHub API for workflow status."
        return 0
    fi

    local repo="clasptek-ai/New-CLASPTEK-Prep-Portal"
    local url="https://api.github.com/repos/$repo/actions/runs?branch=$RELEASE_BRANCH"
    local max_attempts=30
    local attempt=1
    local ci_passed=false

    while [ $attempt -le $max_attempts ]; do
        echo "  Polling CI status (Attempt $attempt/$max_attempts)..."
        local status
        status=$(curl -s -H "User-Agent: ClasptekReleaseBot" "$url" | grep -o '"status": "[^"]*"' | head -n 1 | cut -d'"' -f4 || echo "unknown")
        local conclusion
        conclusion=$(curl -s -H "User-Agent: ClasptekReleaseBot" "$url" | grep -o '"conclusion": "[^"]*"' | head -n 1 | cut -d'"' -f4 || echo "unknown")

        echo "  Status: $status | Conclusion: $conclusion"
        if [ "$status" = "completed" ]; then
            if [ "$conclusion" = "success" ]; then
                echo "✔ GitHub Actions CI Passed!"
                ci_passed=true
                break
            else
                echo "✖ GitHub Actions CI Failed with conclusion '$conclusion'."
                exit 1
            fi
        fi
        sleep 10
        attempt=$((attempt + 1))
    done

    if [ "$ci_passed" = false ]; then
        read -p "[MANUAL CI & PREVIEW CHECK REQUIRED] Did GitHub Actions CI & Vercel Preview pass for commit $commit_hash? (y/n) " user_confirm
        if [[ ! "$user_confirm" =~ ^[Yy]$ ]]; then
            echo "Aborting release: User indicated CI or Preview did not pass."
            exit 1
        fi
    fi
}

manifests=(
    "$MANIFEST_DIR/commit-1-build.txt|build(workspace): configure pnpm allowBuilds, web dependencies, and CI release gate workflow|Commit 1: Build / pnpm / CI"
    "$MANIFEST_DIR/commit-2-api.txt|feat(api): resolve Next.js 15 async params Promise unwrapping and SQL query parameter bindings|Commit 2: Next.js 15 API Compatibility & Route Updates"
    "$MANIFEST_DIR/commit-3-ui.txt|feat(ui): redesign enterprise navigation layouts, student views, global logout dialog, and edge error boundaries|Commit 3: UI / Navigation / Authentication Updates"
    "$MANIFEST_DIR/commit-4-test.txt|test(verification): add end-to-end acceptance test runners, Vitest suites, and database integrity verifiers|Commit 4: Test & Operational Verification Scripts"
    "$MANIFEST_DIR/commit-5-docs.txt|docs(operations): record Release 1.1 operational benchmarks, quality audits, and roadmap|Commit 5: Documentation"
    "$MANIFEST_DIR/commit-6-formatting.txt|style(formatting): align JSX prop indentation in LogoBadge component|Commit 6: Formatting"
)

# Switch to or create release branch
echo "Ensuring release branch '$RELEASE_BRANCH' exists and is active..."
if [ "$DRY_RUN" = false ]; then
    git checkout -b "$RELEASE_BRANCH" 2>/dev/null || git checkout "$RELEASE_BRANCH"
fi

step_num=1
for entry in "${manifests[@]}"; do
    IFS="|" read -r manifest msg title <<< "$entry"
    committed_in_step=false

    echo -e "\n========================================================"
    echo "  $title [Step $step_num/6]"
    echo "========================================================"

    if [ ! -f "$manifest" ]; then
        echo "Manifest file not found: $manifest"
        clean_rollback false
        exit 1
    fi

    # Verify manifest files exist on disk
    echo "Verifying existence of manifest files in $manifest..."
    while IFS= read -r file; do
        [[ -z "$file" || "$file" =~ ^# ]] && continue
        if [ ! -f "$file" ]; then
            echo "MANIFEST VERIFICATION FAILED: File '$file' listed in $manifest does not exist on disk!"
            clean_rollback false
            exit 1
        fi
    done < "$manifest"

    # Stage files from manifest
    echo "Staging files from manifest: $manifest..."
    while IFS= read -r file; do
        [[ -z "$file" || "$file" =~ ^# ]] && continue
        if [ "$DRY_RUN" = true ]; then
            echo "  [DRY-RUN] git add '$file'"
        else
            git add "$file"
        fi
    done < "$manifest"

    if ! run_step "git commit -m \"$msg\"" "Git Commit Step $step_num"; then
        clean_rollback false
        exit 1
    fi
    committed_in_step=true

    verify_manifest_commit_match "$manifest" "$title"
    run_step "git show --stat HEAD" "Post-Commit Inspection"

    echo -e "\nRunning Standardized 5-Step Verification Suite..."
    step_log_prefix="$LOGS_DIR/step-$step_num"
    if ! run_step "pnpm install" "1/5: pnpm install" "$step_log_prefix-install.log" || \
       ! run_step "pnpm lint" "2/5: pnpm lint" "$step_log_prefix-lint.log" || \
       ! run_step "pnpm typecheck" "3/5: pnpm typecheck" "$step_log_prefix-typecheck.log" || \
       ! run_step "pnpm test" "4/5: pnpm test" "$step_log_prefix-test.log" || \
       ! run_step "pnpm build" "5/5: pnpm build" "$step_log_prefix-build.log"; then
        clean_rollback true
        exit 1
    fi

    run_step "git diff --stat HEAD~1 HEAD" "Pre-Push Diff Inspection"
    run_step "git push $REMOTE_NAME $RELEASE_BRANCH" "Push to Release Branch ($REMOTE_NAME/$RELEASE_BRANCH)"

    commit_hash=$(git rev-parse --short HEAD 2>/dev/null || echo "DRYRUN")
    wait_for_ci "$commit_hash"

    step_num=$((step_num + 1))
done

# Immutable Release Artifact Generation
echo -e "\nGenerating immutable release artifact package in $ARTIFACTS_DIR..."
if [ "$DRY_RUN" = false ]; [
    cp "$LOGS_DIR/step-6-install.log" "$ARTIFACTS_DIR/install.log" 2>/dev/null || true
    cp "$LOGS_DIR/step-6-lint.log" "$ARTIFACTS_DIR/lint.log" 2>/dev/null || true
    cp "$LOGS_DIR/step-6-typecheck.log" "$ARTIFACTS_DIR/typecheck.log" 2>/dev/null || true
    cp "$LOGS_DIR/step-6-test.log" "$ARTIFACTS_DIR/test.log" 2>/dev/null || true
    cp "$LOGS_DIR/step-6-build.log" "$ARTIFACTS_DIR/build.log" 2>/dev/null || true

    git rev-parse HEAD > "$ARTIFACTS_DIR/build-hash.txt"
    git log -n 6 --oneline > "$ARTIFACTS_DIR/commit-list.txt"
]

echo -e "\n========================================================"
echo "  ALL 6 COMMITS APPROVED ON '$RELEASE_BRANCH'! ENTERING PRODUCTION GATE"
echo "========================================================"

run_step "git tag -a v$VERSION-rc1 -m \"Release Candidate $VERSION RC1\"" "Create Release Candidate Tag v$VERSION-rc1"

if [ "$DRY_RUN" = false ]; then
    read -p "Do you approve merging '$RELEASE_BRANCH' into '$TARGET_BRANCH' and deploying to Production Vercel? (y/n) " final_confirm
    if [[ ! "$final_confirm" =~ ^[Yy]$ ]]; then
        echo "Aborting production merge."
        exit 1
    fi
fi

run_step "git checkout $TARGET_BRANCH" "Switch to Target Branch ($TARGET_BRANCH)"
run_step "git merge $RELEASE_BRANCH --no-ff -m \"Merge branch '$RELEASE_BRANCH' into master for Release $VERSION\"" "Merge $RELEASE_BRANCH into $TARGET_BRANCH"
run_step "git push $REMOTE_NAME $TARGET_BRANCH" "Push $TARGET_BRANCH to Remote ($REMOTE_NAME/$TARGET_BRANCH)"

run_step "git tag -d v$VERSION-rc1" "Delete Release Candidate Tag v$VERSION-rc1"
run_step "git tag -a v$VERSION -m \"Release 1.1: Enterprise Admin Redesign, Edge Resilience, Next.js 15 API Compatibility\"" "Create Tag v$VERSION"
run_step "git push $REMOTE_NAME v$VERSION" "Push Tag v$VERSION"

run_step "vercel --prod" "Deploy Vercel Production"
run_step "node ./scripts/production-release-audit.js" "Post-Deployment Production Smoke Test"

# Save Deployment Metadata JSON
if [ "$DRY_RUN" = false ]; then
    cat <<EOF > "$DOCS_RELEASE_DIR/v$VERSION.json"
{
  "version": "$VERSION",
  "tag": "v$VERSION",
  "commit": "$(git rev-parse HEAD)",
  "branch": "$RELEASE_BRANCH",
  "targetBranch": "$TARGET_BRANCH",
  "vercelDeployment": "https://portal.clasptek.org",
  "ciRun": "GitHub Actions Run (Passed)",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "production"
}
EOF
    echo "Saved deployment metadata to $DOCS_RELEASE_DIR/v$VERSION.json"
fi

echo -e "\nRELEASE $VERSION IS OFFICIALLY LIVE & VERIFIED IN PRODUCTION! 🎉"
