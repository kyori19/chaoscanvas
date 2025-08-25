# Testing Guide

This document provides information about testing the ChaosCanvas extension.

## Running Tests

### Full Test Suite

To run the complete test suite (requires internet connection to download VSCode):

```bash
npm test
```

### Compile-Only Testing

To verify that tests compile without running them (useful for offline development):

```bash
npm run test-compile
```

This command will:
- Compile all test files
- Compile the extension
- Run linting
- Verify type safety

## Test Structure

The test suite is organized into several files:

- `extension.test.ts` - Core extension functionality and activation
- `commands.test.ts` - Command registration and execution 
- `statusbar.test.ts` - Status bar integration and UI state
- `decorations.test.ts` - Text decoration and syntax highlighting
- `performance.test.ts` - Large file handling and performance limits

## Recent Improvements

The tests have been updated to be more reliable with newer VSCode versions:

### Extension Detection
- Fixed extension ID format to use proper `publisher.name` format
- Improved fallback mechanism when extension isn't found directly
- Better activation waiting logic

### Timing and Reliability
- Increased timeouts for complex operations
- Added explicit waits after command execution
- Better handling of setTimeout-based operations

### Test Configuration
- Added VSCode launch args for better stability
- Configured retries and timeout settings
- Improved error handling

### Sinon Usage
- Better stub cleanup and restoration
- Proper use of `resetHistory()` vs `reset()`
- More reliable spy detection logic

## Debugging Tests

If tests fail:

1. Check that the extension compiles: `npm run compile`
2. Verify tests compile: `npm run compile-tests`
3. Run linting: `npm run lint`
4. Check for type errors: `npm run check-types`

## CI/CD Testing

Tests run automatically in GitHub Actions on:
- All pull requests
- Pushes to main branch
- Multiple operating systems (Ubuntu, macOS, Windows)
- Multiple Node.js versions (20.x, 22.x)

On Linux, tests use `xvfb-run` to provide a virtual display for VSCode.