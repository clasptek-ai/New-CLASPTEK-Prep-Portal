# Developer Setup Playbook

This document walks through onboarding and bootstrapping your local development environment for Clasptek Prep Portal V2.

## System Prerequisites

- **Node.js**: v20 or newer (v24 recommended)
- **pnpm**: v9 or newer (v11 recommended)
- **Git**: v2.0 or newer

## One-Command Bootstrap

To set up all dependencies, TypeScript project references, local caches, and Git hooks:

### On Windows (PowerShell)

```powershell
./scripts/bootstrap.ps1
```

### On Linux / macOS

```bash
./scripts/bootstrap.sh
```

## Running Verification Commands

To verify type safety, coding guidelines, and tests locally:

### On Windows (PowerShell)

```powershell
./scripts/verify.ps1
```

### On Linux / macOS

```bash
./scripts/verify.sh
```

## Task Execution with Turborepo

Build, lint, typecheck, or test specific modules or applications:

```bash
# Build everything
pnpm run build

# Start Next.js dev server
pnpm --filter web dev

# Run Vitest unit tests in watch mode
pnpm --filter testing test
```
