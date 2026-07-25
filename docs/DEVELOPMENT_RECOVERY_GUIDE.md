# Development Recovery Guide
## Clasptek Prep Portal V2

### Overview
This operational guide outlines the mandatory **Development Recovery Protocol** for Clasptek Prep Portal V2. Whenever unexpected runtime exceptions, Webpack module resolution errors (`.call()`), or HTTP 500 status codes occur during local development, execute this recovery protocol BEFORE commencing code-level modifications.

---

### Key Engineering Findings: Contributing Causes
1. **Concurrent Next.js Processes Writing to `.next` (Primary Contributing Cause)**:
   - Running a background `next dev` server while executing `next build` or a secondary dev server creates filesystem race conditions and deletes active cache packs (`ENOENT 6.pack.gz`).
2. **Framework-Level Cache Invalidation**:
   - Internal Next.js 15.5.20 errors (such as `Expected clientReferenceManifest`, `SegmentViewNode`, `ENOENT _document.js`) are generated inside Next.js itself when concurrent cache invalidation occurs.

---

### Mandatory Development Rules

#### Development Rule #1: Stop Active Dev Servers First
Never execute `Remove-Item apps\web\.next -Recurse -Force` while any Next.js process is alive.

```
Stop dev server → Confirm node process exited → Delete .next → Restart dev server → Hard refresh browser
```

#### Development Rule #2: Exclusive Ownership of `.next`
Never run `next build` against the workspace while `next dev` is active. Both commands expect exclusive ownership of the `.next` directory.

#### Development Rule #3: Single Process Boundary
Never run concurrent dev servers (`next dev`) pointing to the same workspace directory on different ports.

---

### Step-by-Step Recovery Procedure

```powershell
# 1. Stop all active Node / Next.js processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Delete .next directory after process termination
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue

# 3. Recompile cleanly
npx tsc --noEmit
npx next dev --port 3000

# 4. Perform browser hard refresh (Ctrl + F5)
```
