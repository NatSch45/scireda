# Scireda UI Tests

This directory contains comprehensive test suites for the Scireda UI application.

## Test Structure

### E2E Tests (`/tests/e2e/`)

End-to-end tests using Playwright that test the complete user workflows:

- **`auth.spec.ts`** - Authentication flows (login, register, validation)
- **`networks.spec.ts`** - Network management (create, list, navigate)
- **`file-explorer.spec.ts`** - File explorer functionality (folders, notes, navigation)
- **`note-editor.spec.ts`** - Note editing (create, edit, auto-save, manual save)
- **`folder-management.spec.ts`** - Folder operations (create, delete, expand, nested folders)
- **`smoke.spec.ts`** - Basic smoke tests (app loads, no errors, responsive)

### Unit Tests (`/tests/unit/`)

Component-level tests using Vitest and React Testing Library.

### Test Helpers (`/tests/e2e/helpers/`)

Reusable utilities for mocking APIs and setting up test scenarios.

## Running Tests

### Prerequisites

Make sure you have all dependencies installed:

```bash
npm install
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run e2e

# Run E2E tests with UI mode (interactive)
npm run e2e:ui

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in debug mode
npx playwright test --debug

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### Unit Tests (Vitest)

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests once
npm run test:run
```

## Test Configuration

### Playwright Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Multiple browsers**: Chrome, Firefox, Safari
- **Mobile testing**: Pixel 5, iPhone 12
- **Screenshots**: Captured on failure
- **Videos**: Recorded on failure
- **Traces**: Captured on retry
- **Parallel execution**: Tests run in parallel for speed
- **CI optimization**: Different settings for CI vs local development

### Test Data & Mocking

Tests use comprehensive API mocking to ensure:

- **Isolation**: Tests don't depend on external services
- **Reliability**: Consistent test data and responses
- **Speed**: No network delays from real API calls
- **Coverage**: Can test error scenarios easily

## Test Categories

### Authentication Tests
- ✅ Login page display
- ✅ Form validation
- ✅ Registration flow
- ✅ Error handling

### Network Management Tests
- ✅ Network listing
- ✅ Network creation
- ✅ Network navigation
- ✅ Empty states

### File Explorer Tests
- ✅ Folder and note display
- ✅ Folder expansion/collapse
- ✅ Double-click navigation
- ✅ Note selection
- ✅ Creation forms
- ✅ Delete confirmations

### Note Editor Tests
- ✅ Note loading and display
- ✅ Title and content editing
- ✅ Auto-save functionality
- ✅ Manual save
- ✅ Save status indicators
- ✅ Unsaved changes handling

### Folder Management Tests
- ✅ Folder hierarchy display
- ✅ Nested folder navigation
- ✅ Context menus
- ✅ Folder creation in context
- ✅ Delete confirmations (simple & force)
- ✅ Empty folder handling

### Smoke Tests
- ✅ Application loading
- ✅ Basic navigation
- ✅ Console error detection
- ✅ Responsive design

## Best Practices

### Test Organization
- Each test file focuses on a specific feature area
- Tests are grouped in `describe` blocks for better organization
- Helper functions are extracted for reusability

### API Mocking
- Comprehensive mocking covers all API endpoints
- Mock data is realistic and consistent
- Error scenarios are easily testable

### Assertions
- Tests use descriptive assertions
- Wait for elements to be visible before interacting
- Handle async operations properly

### Maintenance
- Tests are written to be maintainable and readable
- Selectors prefer semantic queries (text, roles) over CSS selectors
- Mock data is typed for better IDE support

## Debugging Tests

### View Test Reports
```bash
# Open HTML report after running tests
npx playwright show-report
```

### Debug Failing Tests
```bash
# Run specific test in debug mode
npx playwright test auth.spec.ts --debug

# Run with browser visible
npx playwright test --headed

# Run with slow motion
npx playwright test --headed --slowMo=1000
```

### Screenshots and Videos
- Screenshots are automatically captured on test failures
- Videos are recorded for failing tests
- Traces can be viewed in the Playwright trace viewer

## CI/CD Integration

The test configuration is optimized for CI environments:
- Retries failed tests automatically
- Runs tests serially in CI for stability
- Generates JUnit XML reports for integration
- Captures artifacts (screenshots, videos) for debugging

## Contributing

When adding new features:
1. Add corresponding E2E tests for user workflows
2. Update existing tests if behavior changes
3. Use the helper functions for common setup
4. Follow the existing test patterns and naming conventions
