# Component Structure & Mandatory 6-State Lifecycle

**Status**: Canonical Standard

Every atomic component folder under `src/shared/ui/[component]/` MUST contain:

- `ComponentName.tsx` (Functional React Component)
- `ComponentName.types.ts` (TypeScript DTO Interfaces)
- `ComponentName.test.tsx` (Vitest Unit Test Suite)
- `ComponentName.docs.md` (Usage documentation)
- `ComponentName.stories.tsx` (Storybook integration template)

## Mandatory 6-State Lifecycle

Every component MUST support:

1. `Loading`
2. `Disabled`
3. `Error`
4. `Empty`
5. `Success`
6. `Responsive`
