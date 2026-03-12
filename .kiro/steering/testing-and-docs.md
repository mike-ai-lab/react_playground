---
inclusion: always
---

# Testing and Documentation Rules

## Test Organization

### Test File Location
- NEVER scatter test files throughout the workspace
- ALL test files must be organized in a dedicated location
- Create tests in one of these structures:
  - `tests/` directory at project root
  - `__tests__/` directory within relevant module
  - Co-located with source files using `.test.js` or `.spec.js` suffix

### Test Results and Artifacts
- Store test results in a single designated location
- Use `tests/results/` or `test-results/` directory
- Keep test logs, coverage reports, and output files organized
- NEVER create scattered result files in random locations

### Test Execution Logs
- Consolidate all test execution logs in one place
- Use consistent naming: `test-results-YYYY-MM-DD.txt` or similar
- Clean up old test artifacts regularly

## Documentation Rules

### Single Documentation File Policy
- For any new feature, create ONLY ONE documentation file
- File should be named clearly: `feature-name.md`
- Place in `docs/` directory or project root as appropriate

### Documentation Updates
- DO NOT update feature documentation until user confirms feature is fully working
- DO NOT create multiple documentation files for the same feature
- DO NOT create summary files, progress files, or status files automatically

### Documentation Workflow
1. Create single documentation file when starting feature work
2. Keep it minimal - just essential information
3. Wait for user confirmation that feature works
4. Only then update documentation with final details

### Prohibited Documentation Practices
- NEVER create multiple docs for one feature (no v1, v2, draft, final, etc.)
- NEVER create automatic summaries or progress reports
- NEVER update docs speculatively before feature completion
- NEVER create README files unless explicitly requested

## Examples

### Good Test Organization
```
project/
├── src/
│   └── components/
│       └── Button.jsx
├── tests/
│   ├── components/
│   │   └── Button.test.js
│   └── results/
│       └── test-run-2026-03-11.txt
└── docs/
    └── button-feature.md
```

### Bad Test Organization (DO NOT DO THIS)
```
project/
├── src/
│   └── components/
│       ├── Button.jsx
│       └── test-output.txt
├── test1.js
├── test-results.txt
├── console-log.txt
├── docs/
│   ├── button-draft.md
│   ├── button-v2.md
│   └── button-final.md
└── FEATURE-SUMMARY.md
```

## Key Principles
1. Organization over chaos - keep tests and results in designated locations
2. Minimal documentation - one file per feature
3. Wait for confirmation - do not prematurely update docs
4. No automatic summaries - only create docs when explicitly needed
