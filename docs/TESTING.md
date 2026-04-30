# Testing

## Commands

```bash
npm test
npm run test:watch
```

## What’s Covered

- Pure utility and data integrity checks in [iconStudio.ts](file:///Users/cto/Documents/Repositories/02-Pro/app-icon-generator/utils/iconStudio.ts)
  - Platform labels and export summaries
  - Export spec naming uniqueness
  - Default settings shape and bounds
  - Clipart helpers fallbacks

## Adding Tests

- Put unit tests next to the logic under `utils/__tests__/*.test.ts`.
- Prefer testing pure functions and deterministic data first.

