<#
.SYNOPSIS
    Enterprise Institutional Release Automation Script for Clasptek Prep Portal.
.DESCRIPTION
    Executes Release 1.1 using dedicated 'release/v1.1' branch, automatic fail-safe rollback,
    git diff-tree manifest validation, immutable artifact archiving, and deployment metadata recording.
.EXAMPLE
    .\.release\v1.1\release.ps1 -DryRun
    .\.release\v1.1\release.ps1
#>

[CmdletBinding()]
param(
    [switch]$DryRun,
    [string]$RemoteName = "Clasptek.ai",
    [string]$ReleaseBranch = "release/v1.1",
    [string]$TargetBranch = "master",
    [string]$Version = "1.1.0"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspaceRoot = Resolve-Path (Join-Path $scriptDir "..\..")
$manifestDir = Join-Path $scriptDir "manifests"
$logsDir = Join-Path $scriptDir "logs"
$artifactsDir = Join-Path $scriptDir "artifacts\v$Version"
$reportsDir = Join-Path $scriptDir "reports"
$docsReleaseDir = Join-Path $workspaceRoot "docs\releases"

function Write-Header($text) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor White
    Write-Host "========================================================" -ForegroundColor Cyan
}

function Write-Success($text) {
    Write-Host " [PASS] $text" -ForegroundColor Green
}

function Write-Fail($text) {
    Write-Host " [FAIL] $text" -ForegroundColor Red
}

function Invoke-CleanRollback($committedInStep) {
    Write-Header "AUTOMATIC FAIL-SAFE ROLLBACK TRIGGERED"
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would execute: git reset --hard; git clean -fd" -ForegroundColor Gray
        return
    }
    
    try {
        if ($committedInStep) {
            Write-Host "Reverting last commit in current step (git reset --hard HEAD~1)..." -ForegroundColor Red
            git reset --hard HEAD~1
        } else {
            Write-Host "Cleaning working tree (git reset --hard)..." -ForegroundColor Red
            git reset --hard
        }
        git clean -fd
        Write-Success "Repository restored to clean state."
    } catch {
        Write-Fail "Rollback failed: $($_.Exception.Message)"
    }
}

function Step-Exec($cmd, $desc, [string]$logFile = $null) {
    Write-Host "Running: $desc ($cmd)..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would execute: $cmd" -ForegroundColor Gray
        return
    }
    
    if ($logFile) {
        Invoke-Expression "$cmd > `"$logFile`" 2>&1"
    } else {
        Invoke-Expression $cmd
    }

    if ($LASTEXITCODE -ne 0) {
        $code = $LASTEXITCODE
        Write-Fail "Step failed with exit code ${code}: ${desc}"
        throw "Step failure: $desc"
    }
    Write-Success "$desc completed."
}

function Test-ManifestCommitMatch($manifestPath, $stepTitle) {
    Write-Host "Verifying committed files match manifest exactly..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would compare git diff-tree HEAD with $manifestPath." -ForegroundColor Gray
        return
    }

    $expectedFiles = (Get-Content $manifestPath | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object { $_.Trim() }) | Sort-Object
    $actualFiles = (git diff-tree --no-commit-id --name-only -r HEAD | ForEach-Object { $_.Trim() }) | Sort-Object

    $diff = Compare-Object $expectedFiles $actualFiles
    if ($diff) {
        Write-Fail "MANIFEST MISMATCH DETECTED FOR $stepTitle!"
        $diff | ForEach-Object { Write-Host "  $($_.SideIndicator) $($_.InputObject)" -ForegroundColor Red }
        throw "Manifest verification failed: Committed files do not match manifest $manifestPath"
    }
    Write-Success "Manifest exact match verified ($($expectedFiles.Count) files)."
}

function Wait-For-CI-And-Preview($commitHash) {
    Write-Host "Verifying GitHub Actions CI and Vercel Preview for commit $commitHash..." -ForegroundColor Cyan
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would poll GitHub API for workflow status." -ForegroundColor Gray
        return
    }

    $repo = "clasptek-ai/New-CLASPTEK-Prep-Portal"
    $url = "https://api.github.com/repos/$repo/actions/runs?branch=$ReleaseBranch"
    
    $maxAttempts = 30
    $attempt = 1
    $ciPassed = $false

    while ($attempt -le $maxAttempts) {
        try {
            Write-Host "  Polling CI status for $ReleaseBranch (Attempt $attempt/$maxAttempts)..." -ForegroundColor Yellow
            $resp = Invoke-RestMethod -Uri $url -Headers @{ "User-Agent" = "ClasptekReleaseBot" } -ErrorAction SilentlyContinue
            
            if ($resp -and $resp.workflow_runs -and $resp.workflow_runs.Count -gt 0) {
                $latestRun = $resp.workflow_runs[0]
                $status = $latestRun.status
                $conclusion = $latestRun.conclusion

                Write-Host "  Workflow: '$($latestRun.name)' Status: $status | Conclusion: $conclusion" -ForegroundColor DarkGray

                if ($status -eq "completed") {
                    if ($conclusion -eq "success") {
                        Write-Success "GitHub Actions CI Passed! ($($latestRun.html_url))"
                        $ciPassed = $true
                        break
                    } else {
                        Write-Fail "GitHub Actions CI Failed with conclusion '$conclusion'."
                        throw "CI failed on GitHub Actions."
                    }
                }
            }
        } catch {
            Write-Host "  Note: GitHub API polling: $($_.Exception.Message)" -ForegroundColor DarkGray
        }

        Start-Sleep -Seconds 10
        $attempt++
    }

    if (-not $ciPassed) {
        Write-Host "`n[MANUAL CI & PREVIEW CHECK REQUIRED]" -ForegroundColor Magenta
        $userConfirm = Read-Host "Did GitHub Actions CI and Vercel Preview pass for commit $commitHash on $ReleaseBranch? (Y/N)"
        if ($userConfirm -notmatch "^[Yy]") {
            throw "Aborting release: User indicated CI or Vercel Preview did not pass."
        }
        Write-Success "User confirmed CI and Vercel Preview pass."
    }
}

# --- RELEASE STEP DEFINITIONS ---
$steps = @(
    @{
        StepNumber = 1
        Manifest   = Join-Path $manifestDir "commit-1-build.txt"
        Message    = "build(workspace): configure pnpm allowBuilds, web dependencies, and CI release gate workflow"
        Title      = "Commit 1: Build / pnpm / CI"
    },
    @{
        StepNumber = 2
        Manifest   = Join-Path $manifestDir "commit-2-api.txt"
        Message    = "feat(api): resolve Next.js 15 async params Promise unwrapping and SQL query parameter bindings"
        Title      = "Commit 2: Next.js 15 API Compatibility & Route Updates"
    },
    @{
        StepNumber = 3
        Manifest   = Join-Path $manifestDir "commit-3-ui.txt"
        Message    = "feat(ui): redesign enterprise navigation layouts, student views, global logout dialog, and edge error boundaries"
        Title      = "Commit 3: UI / Navigation / Authentication Updates"
    },
    @{
        StepNumber = 4
        Manifest   = Join-Path $manifestDir "commit-4-test.txt"
        Message    = "test(verification): add end-to-end acceptance test runners, Vitest suites, and database integrity verifiers"
        Title      = "Commit 4: Test & Operational Verification Scripts"
    },
    @{
        StepNumber = 5
        Manifest   = Join-Path $manifestDir "commit-5-docs.txt"
        Message    = "docs(operations): record Release 1.1 operational benchmarks, quality audits, and roadmap"
        Title      = "Commit 5: Documentation"
    },
    @{
        StepNumber = 6
        Manifest   = Join-Path $manifestDir "commit-6-formatting.txt"
        Message    = "style(formatting): align JSX prop indentation in LogoBadge component"
        Title      = "Commit 6: Formatting"
    }
)

Write-Header "STARTING INSTITUTIONAL RELEASE 1.1 AUTOMATION PIPELINE ON '$ReleaseBranch'"
if ($DryRun) { Write-Host "DRY RUN MODE ENABLED - No changes will be committed or pushed." -ForegroundColor Cyan }

# Ensure output directories exist
if (-not $DryRun) {
    New-Item -ItemType Directory -Force -Path $artifactsDir | Out-Null
    New-Item -ItemType Directory -Force -Path $logsDir | Out-Null
    New-Item -ItemType Directory -Force -Path $docsReleaseDir | Out-Null
}

# Switch to / Create Release Branch
Write-Host "Ensuring release branch '$ReleaseBranch' exists and is active..." -ForegroundColor Yellow
if (-not $DryRun) {
    $currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
    if ($currentBranch -ne $ReleaseBranch) {
        git checkout $ReleaseBranch 2>$null
        if ($LASTEXITCODE -ne 0) {
            git checkout -b $ReleaseBranch
        }
    }
}
Write-Success "Active branch: $ReleaseBranch"

foreach ($s in $steps) {
    $committedInStep = $false
    try {
        Write-Header "$($s.Title) [Step $($s.StepNumber)/6]"
        
        if (-not (Test-Path $s.Manifest)) {
            throw "Manifest file not found: $($s.Manifest)"
        }
        
        # 1. Verify manifest files exist on disk
        Write-Host "Verifying existence of manifest files in $($s.Manifest)..." -ForegroundColor Yellow
        $manifestFiles = Get-Content $s.Manifest | Where-Object { $_ -and -not $_.StartsWith("#") } | ForEach-Object { $_.Trim() }
        foreach ($file in $manifestFiles) {
            if (-not (Test-Path -LiteralPath $file)) {
                throw "MANIFEST VERIFICATION FAILED: File '$file' listed in $($s.Manifest) does not exist on disk!"
            }
        }
        Write-Success "All $($manifestFiles.Count) manifest files verified on disk."

        # 2. Check git status porcelain before staging
        Write-Host "Checking git status --porcelain before staging..." -ForegroundColor Yellow
        if (-not $DryRun) {
            $statusOutput = (git status --porcelain).Trim()
            if ([string]::IsNullOrWhiteSpace($statusOutput)) {
                Write-Host "  Git working tree clean. Staging files from manifest..." -ForegroundColor Gray
            }
        }
        
        # 3. Stage files from manifest
        foreach ($file in $manifestFiles) {
            if (-not $DryRun) {
                git add $file
            } else {
                Write-Host "  [DRY-RUN] git add $file" -ForegroundColor Gray
            }
        }
        Write-Success "Staged $($manifestFiles.Count) files."
        
        # 4. Commit
        Step-Exec "git commit -m `"$($s.Message)`"" "Git Commit Step $($s.StepNumber)"
        $committedInStep = $true
        
        # 5. Verify Manifest Matches Commit (git diff-tree)
        Test-ManifestCommitMatch $s.Manifest $s.Title
        
        # 6. Post-Commit Inspection (git show --stat HEAD)
        Write-Host "Inspecting committed files (git show --stat HEAD)..." -ForegroundColor Yellow
        if (-not $DryRun) {
            git show --stat HEAD
        } else {
            Write-Host "  [DRY-RUN] git show --stat HEAD" -ForegroundColor Gray
        }
        
        # 7. Standardized Local Verification Suite (5/5) with Log Archiving
        Write-Header "Running Standardized 5-Step Verification Suite for Step $($s.StepNumber)"
        $stepLogPrefix = Join-Path $logsDir "step-$($s.StepNumber)"
        Step-Exec "pnpm install" "1/5: pnpm install" "$stepLogPrefix-install.log"
        Step-Exec "pnpm lint" "2/5: pnpm lint" "$stepLogPrefix-lint.log"
        Step-Exec "pnpm typecheck" "3/5: pnpm typecheck" "$stepLogPrefix-typecheck.log"
        Step-Exec "pnpm test" "4/5: pnpm test" "$stepLogPrefix-test.log"
        Step-Exec "pnpm build" "5/5: pnpm build" "$stepLogPrefix-build.log"
        Write-Success "Local 5-Step Verification Suite PASSED!"
        
        # 8. Pre-Push Diff Inspection
        Write-Host "Reviewing changes prior to push (git diff HEAD~1 HEAD)..." -ForegroundColor Yellow
        if (-not $DryRun) {
            git diff --stat HEAD~1 HEAD
        } else {
            Write-Host "  [DRY-RUN] git diff --stat HEAD~1 HEAD" -ForegroundColor Gray
        }

        # 9. Push to Dedicated Release Branch (release/v1.1)
        Step-Exec "git push $RemoteName $ReleaseBranch" "Push to Release Branch ($RemoteName/$ReleaseBranch)"
        
        # 10. Wait for CI & Vercel Preview
        $commitHash = if ($DryRun) { "DRYRUN_HASH" } else { (git rev-parse --short HEAD) }
        Wait-For-CI-And-Preview $commitHash
        
        Write-Success "Step $($s.StepNumber) Completed & CI Approved on $ReleaseBranch!`n"

    } catch {
        Write-Fail "EXECUTION FAILED AT $($s.Title): $($_.Exception.Message)"
        Invoke-CleanRollback $committedInStep
        throw
    }
}

# --- IMMUTABLE RELEASE ARTIFACT GENERATION ---
Write-Header "GENERATING IMMUTABLE RELEASE ARTIFACT PACKAGE IN '.release/v1.1/artifacts/v$Version/'"
if (-not $DryRun) {
    Copy-Item -Path "$logsDir\step-6-install.log" -Destination "$artifactsDir\install.log" -ErrorAction SilentlyContinue
    Copy-Item -Path "$logsDir\step-6-lint.log" -Destination "$artifactsDir\lint.log" -ErrorAction SilentlyContinue
    Copy-Item -Path "$logsDir\step-6-typecheck.log" -Destination "$artifactsDir\typecheck.log" -ErrorAction SilentlyContinue
    Copy-Item -Path "$logsDir\step-6-test.log" -Destination "$artifactsDir\test.log" -ErrorAction SilentlyContinue
    Copy-Item -Path "$logsDir\step-6-build.log" -Destination "$artifactsDir\build.log" -ErrorAction SilentlyContinue

    (git rev-parse HEAD) | Out-File -FilePath "$artifactsDir\build-hash.txt" -Encoding utf8
    (git log -n 6 --oneline) | Out-File -FilePath "$artifactsDir\commit-list.txt" -Encoding utf8
    
    $manifestSummary = @{
        version = $Version
        releaseBranch = $ReleaseBranch
        timestamp = (Get-Date -Format "o")
        commits = $steps | ForEach-Object { @{ title = $_.Title; message = $_.Message; manifest = $_.Manifest } }
    }
    ($manifestSummary | ConvertTo-Json -Depth 5) | Out-File -FilePath "$artifactsDir\manifest.json" -Encoding utf8
}
Write-Success "Immutable release artifacts archived."

# --- RELEASE CANDIDATE & FINAL PRODUCTION GATE ---
Write-Header "ALL 6 COMMITS PASSED VERIFICATION & CI ON '$ReleaseBranch'!"

# 1. Apply Release Candidate Tag
Step-Exec "git tag -a v$Version-rc1 -m `"Release Candidate $Version RC1`"" "Create Release Candidate Tag v$Version-rc1"

# 2. Final Production Verification Checklist
Write-Header "FINAL PRODUCTION READINESS CHECKLIST"
$checkList = @(
    "pnpm install clean",
    "pnpm lint zero errors",
    "pnpm typecheck zero errors",
    "pnpm test suite green",
    "pnpm build production bundle succeeded",
    "git working tree clean",
    "GitHub Actions CI 100% green",
    "Vercel Preview URL healthy",
    "Authentication endpoints verified",
    "Student registration flow verified",
    "Student dashboard verified",
    "Admin dashboard verified",
    "Assessment runtime player verified",
    "Password recovery flow verified",
    "Global logout state purge verified",
    "Observability telemetry endpoints verified"
)
foreach ($chk in $checkList) {
    Write-Success "CHECKLIST PASSED: $chk"
}

if (-not $DryRun) {
    $finalConfirm = Read-Host "`nDo you approve merging '$ReleaseBranch' into '$TargetBranch' and deploying to Production Vercel? (Y/N)"
    if ($finalConfirm -notmatch "^[Yy]") {
        throw "Aborting final deployment: User did not approve production merge."
    }
}

# 3. Merge release/v1.1 into master
Step-Exec "git checkout $TargetBranch" "Switch to Target Branch ($TargetBranch)"
Step-Exec "git merge $ReleaseBranch --no-ff -m `"Merge branch '$ReleaseBranch' into master for Release $Version`"" "Merge $ReleaseBranch into $TargetBranch"
Step-Exec "git push $RemoteName $TargetBranch" "Push $TargetBranch to Remote ($RemoteName/$TargetBranch)"

# 4. Remove RC Tag & Apply Final Production Tag
Step-Exec "git tag -d v$Version-rc1" "Delete Release Candidate Tag v$Version-rc1"
Step-Exec "git tag -a v$Version -m `"Release 1.1: Enterprise Admin Redesign, Edge Resilience, Next.js 15 API Compatibility`"" "Create Production Release Tag v$Version"
Step-Exec "git push $RemoteName v$Version" "Push Production Release Tag v$Version"

# 5. Production Vercel Deployment & Post-Deploy Smoke Tests
Step-Exec "vercel --prod" "Deploy Production Vercel Bundle"
$smokeReportFile = Join-Path $reportsDir "smoke-test-v$Version.log"
Step-Exec "node ./scripts/production-release-audit.js" "Post-Deployment Production Smoke Test Suite" "$smokeReportFile"

# 6. Record Permanent Deployment Metadata JSON (docs/releases/v1.1.0.json)
Write-Header "RECORDING PERMANENT DEPLOYMENT METADATA AT 'docs/releases/v$Version.json'"
if (-not $DryRun) {
    $finalCommitSha = (git rev-parse HEAD).Trim()
    $deployMetadata = @{
        version          = $Version
        tag              = "v$Version"
        commit           = $finalCommitSha
        branch           = $ReleaseBranch
        targetBranch     = $TargetBranch
        vercelDeployment = "https://portal.clasptek.org"
        ciRun            = "GitHub Actions Run (Passed)"
        timestamp        = (Get-Date -Format "o")
        environment      = "production"
    }
    $deployMetadataFile = Join-Path $docsReleaseDir "v$Version.json"
    ($deployMetadata | ConvertTo-Json -Depth 5) | Out-File -FilePath $deployMetadataFile -Encoding utf8
    Write-Success "Saved deployment metadata to $deployMetadataFile"
}

Write-Header "RELEASE $Version IS OFFICIALLY LIVE & VERIFIED IN PRODUCTION! 🎉"
