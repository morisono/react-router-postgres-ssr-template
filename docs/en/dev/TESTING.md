# Testing Configuration

This project has been configured for CI/CD testing with comprehensive test coverage across different environments.

## Test Structure

### Available Test Commands

- **`npm run test`** - Main test command (CI-friendly, runs unit and component tests)
- **`npm run test:ci`** - Explicit CI mode with JUnit XML output
- **`npm run test:unit`** - Unit tests only
- **`npm run test:components`** - Component tests only
- **`npm run test:workers`** - Cloudflare Workers tests
- **`npm run test:workers:ci`** - Workers tests with CI reporting
- **`npm run test:integration`** - Database integration tests (requires DB setup)
- **`npm run test:e2e`** - End-to-end tests with Playwright
- **`npm run test:watch`** - Development mode with file watching
- **`npm run test:all`** - Runs unit and component tests sequentially

### Test Configuration Files

- **`vitest.config.ts`** - Main configuration for unit and component tests
- **`tests/vitest.config.unit.ts`** - Unit test specific configuration
- **`tests/vitest.config.components.ts`** - React component test configuration
- **`tests/vitest.config.workers.ts`** - Cloudflare Workers test configuration
- **`tests/vitest.config.integration.ts`** - Database integration test configuration

## CI/CD Integration

### CI Features

✅ **Non-interactive execution** - Tests run once and exit  
✅ **JUnit XML reports** - Generated automatically in CI environments  
✅ **GitHub Actions integration** - Proper reporter configuration  
✅ **Coverage reporting** - Available for unit and component tests  
✅ **Proper exit codes** - Fails CI builds when tests fail  

### CI Environment Detection

The test configuration automatically detects CI environments using the `CI` environment variable:

```bash
# Local development
npm run test

# CI environment (with JUnit output)
CI=true npm run test
# or
npm run test:ci
```

### Coverage Limitations

- **Unit & Component Tests**: Full coverage support
- **Workers Tests**: Coverage is **automatically disabled** due to Cloudflare Workers runtime limitations
- **Integration Tests**: Coverage depends on database setup

### ⚠️ Important: Worker Tests and Coverage

Worker tests cannot use coverage due to Cloudflare Workers runtime limitations. The configuration automatically disables coverage for worker tests, even if the `--coverage` flag is passed.

```bash
# These commands are safe - coverage is automatically disabled for workers
npm run test:workers -- --coverage  # Coverage ignored
npm run test:workers:ci              # No coverage, CI-friendly

# Coverage works for other test types
npm run test:unit -- --coverage      # ✅ Coverage enabled
npm run test:components -- --coverage # ✅ Coverage enabled
```

## CI Usage Examples

### GitHub Actions

```yaml
- name: Run Tests
  run: npm run test:ci

- name: Run Worker Tests
  run: npm run test:workers:ci

- name: Run Unit Tests with Coverage
  run: npm run test:unit -- --coverage
```

### Other CI Systems

```bash
# Basic test run
npm run test

# With coverage
npm run test -- --coverage

# Workers (no coverage)
npm run test:workers

# All tests except integration
npm run test:all && npm run test:workers
```

## Test Output

### JUnit XML Reports

When `CI=true` is set, tests generate JUnit XML reports at:
- `test-results.xml` - Main test results

### Coverage Reports

Coverage reports are generated in multiple formats:
- Text output in terminal
- HTML report in `coverage/` directory
- JSON report for CI integration

## Troubleshooting

### Worker Tests with Coverage

If you encounter "node:inspector" errors when running worker tests with coverage:

```bash
# Don't use --coverage with worker tests
npm run test:workers

# Coverage is automatically disabled for worker tests
npm run test:workers:coverage  # Shows informational message
```

### Environment Variables

Make sure these files exist for proper test execution:
- `.dev.vars.test` - Test environment variables
- `wrangler.jsonc` - Cloudflare Workers configuration

## Test Results Summary

- **26 total tests** across all test suites
- **21 unit & component tests** (with coverage)
- **5 worker tests** (coverage disabled)
- **CI-ready configuration** with proper reporting