# Developer Troubleshooting Playbook

This playbook helps resolve common local monorepo, Turborepo, pnpm, and compiler issues.

## Issue 1: TypeScript type checking is stale

**Symptom**: TS compiler complains about missing symbols or incorrect types after code shifts or branch updates.
**Resolution**:

1. Stale incremental compiler caches might be present. Run:
   ```bash
   pnpm run typecheck --force
   ```
2. Clear the build artifacts globally:
   ```bash
   pnpm -r exec rm -rf dist .turbo tsconfig.tsbuildinfo
   ```

## Issue 2: Import Violations in Architecture tests

**Symptom**: Architecture checks fail claiming "Forbidden cross-domain import" or "Server leakage".
**Resolution**:

- Check `dependency-cruiser.config.js` in the workspace root.
- Ensure that browser files (`apps/web/src/app/...`) do not import from server-only directories (`packages/persistence`, `packages/configuration`, etc.).
- Ensure that domain context boundaries are not crossed (e.g. Identity & Access context importing from question bank).

## Issue 3: pnpm Lockfile Conflicts

**Symptom**: Git merge conflicts inside `pnpm-lock.yaml`.
**Resolution**:

1. Do not resolve manually. Run:
   ```bash
   pnpm install
   ```
2. Git will re-integrate dependency declarations automatically. Commit the resolved `pnpm-lock.yaml`.
