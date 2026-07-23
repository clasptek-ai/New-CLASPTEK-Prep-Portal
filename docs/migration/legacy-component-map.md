# Legacy Component Migration Map — Sprint 002H

| Legacy Layout / Component     | Target Design System Primitive (`@/shared/ui`)       | Workspace                    | Migration Status |
| :---------------------------- | :--------------------------------------------------- | :--------------------------- | :--------------- |
| `old-sidebar` / ad-hoc navbar | `WorkspaceShell` + `SidebarItem` + `NavigationGroup` | All                          | ✅ **Migrated**  |
| `old-header` / header divs    | `TopNavigation` + `Breadcrumb`                       | All                          | ✅ **Migrated**  |
| `old-auth-layout`             | `AuthShell` + `Input` + `Alert` + `Button`           | Auth (`/login`, `/register`) | ✅ **Migrated**  |
| `old-dashboard-card`          | `Card` + `StatCard` + `InfoCard`                     | Student / Instructor / Admin | ✅ **Migrated**  |
| native HTML `<table>`         | Layer 1 `Table` + Layer 2 `DataTable`                | All                          | ✅ **Migrated**  |
| ad-hoc `div` badges           | `Badge` + `StatusBadge`                              | All                          | ✅ **Migrated**  |
| custom buttons                | `Button` + `IconButton`                              | All                          | ✅ **Migrated**  |
| custom loaders                | `Spinner` + `Skeleton` + `ProgressBar`               | All                          | ✅ **Migrated**  |
| custom modals                 | `Modal` + `ConfirmDialog` + `OverlayProvider`        | All                          | ✅ **Migrated**  |
