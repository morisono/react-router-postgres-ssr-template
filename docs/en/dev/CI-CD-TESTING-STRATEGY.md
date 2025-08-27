# Comprehensive CI/CD Test Strategy

This document outlines the complete automated testing and deployment strategy for the React Router + Postgres SSR template running on Cloudflare Workers.

## 🎯 Overview

Our CI/CD pipeline is designed with the following principles:
- **Fast Feedback**: Quick failure detection with parallel execution
- **Quality Gates**: Rigorous testing at multiple levels
- **Security First**: Automated vulnerability scanning and code analysis
- **Performance Monitoring**: Continuous performance regression detection
- **Reliability**: Flaky test management and retry strategies

## 🏗️ Pipeline Architecture

### Stage 1: Code Quality & Security (Parallel)
- **Lint & Format Check**: ESLint, Prettier, TypeScript compilation
- **Security Scanning**: Snyk, npm audit, CodeQL analysis
- **Dependency Review**: Automated dependency vulnerability assessment

### Stage 2: Unit Tests (Parallel with Stage 1)
- **Unit Tests**: Component logic, utilities, pure functions
- **Workers Tests**: Cloudflare Workers runtime testing
- **Component Tests**: React component rendering and behavior

### Stage 3: Integration Tests
- **API Integration**: Database operations, HTTP endpoints
- **Service Integration**: Worker-to-worker communication
- **Database Testing**: Schema validation, data integrity

### Stage 4: Build & Analysis
- **Application Build**: Production build generation
- **Bundle Analysis**: Size monitoring and optimization
- **Static Asset Optimization**: Image and asset processing

### Stage 5: End-to-End Tests
- **Browser Testing**: Multi-browser compatibility (Chrome, Firefox, Safari)
- **Mobile Testing**: Responsive design validation
- **User Journey Testing**: Critical path validation

### Stage 6: Performance & Accessibility
- **Lighthouse CI**: Core Web Vitals, performance metrics
- **Load Testing**: Stress testing with k6
- **Accessibility Auditing**: WCAG compliance validation

### Stage 7: Deployment Gates
- **Criteria Validation**: All tests pass, security cleared
- **Manual Approval**: (Optional) for production deployments
- **Rollback Strategy**: Automated rollback on failure

### Stage 8: Production Deployment
- **Database Migrations**: Schema updates via Drizzle
- **Worker Deployment**: Cloudflare Workers deployment
- **Static Assets**: Asset deployment to Workers Static Assets

### Stage 9: Post-Deployment
- **Smoke Tests**: Critical functionality verification
- **Monitoring Setup**: Error tracking, performance monitoring
- **Health Checks**: Continuous availability monitoring

## 🧪 Test Types & Configuration

### Unit Tests
- **Framework**: Vitest with Cloudflare Workers pool
- **Coverage Target**: 80% line coverage, 70% branch coverage
- **Location**: `tests/unit/`, `app/**/*.test.{ts,tsx}`
- **Run Command**: `npm run test:unit`

```typescript
// Example unit test structure
describe('BookUtils', () => {
  it('should format book title correctly', () => {
    expect(formatBookTitle('  The Great Gatsby  ')).toBe('The Great Gatsby');
  });
});
```

### Component Tests
- **Framework**: Vitest + Testing Library
- **Environment**: jsdom for DOM simulation
- **Location**: `tests/components/`
- **Run Command**: `npm run test:components`

```typescript
// Example component test
test('BookCard renders book information', () => {
  render(<BookCard book={mockBook} />);
  expect(screen.getByText('The Great Gatsby')).toBeInTheDocument();
});
```

### Integration Tests
- **Framework**: Vitest with real database
- **Database**: PostgreSQL test instance
- **Location**: `tests/integration/`
- **Run Command**: `npm run test:integration`

```typescript
// Example integration test
test('Books API returns paginated results', async () => {
  const response = await fetch('/api/books?page=1&limit=10');
  expect(response.status).toBe(200);
});
```

### End-to-End Tests
- **Framework**: Playwright
- **Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Location**: `tests/e2e/`
- **Run Command**: `npm run test:e2e`

```typescript
// Example E2E test
test('User can browse and view book details', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="book-card"]:first-child');
  await expect(page).toHaveURL(/\/books\/\d+/);
});
```

### Load Tests
- **Framework**: k6
- **Scenarios**: Gradual ramp-up, sustained load, spike testing
- **Location**: `tests/load/`
- **Run Command**: `npm run test:load`

## 🔧 Environment Configuration

### Test Environments

#### Development
- **Trigger**: Every push to feature branches
- **Database**: Shared test database
- **Deployment**: Preview environment via Cloudflare

#### Staging
- **Trigger**: Push to `develop` branch
- **Database**: Staging database with production-like data
- **Deployment**: Staging environment

#### Production
- **Trigger**: Push to `main` branch (after all checks pass)
- **Database**: Production database
- **Deployment**: Production Cloudflare Workers

### Environment Variables

```bash
# Test Environment
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/test_db
HYPERDRIVE=test_hyperdrive_connection

# CI/CD Secrets (GitHub Secrets)
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
HYPERDRIVE_PREVIEW=preview_hyperdrive_id
HYPERDRIVE_PRODUCTION=production_hyperdrive_id
DATABASE_URL_PREVIEW=preview_database_url
DATABASE_URL_PRODUCTION=production_database_url
SNYK_TOKEN=your_snyk_token
CODECOV_TOKEN=your_codecov_token
SLACK_WEBHOOK=your_slack_webhook_url
```

## 📊 Test Data Management

### Strategy
1. **Isolated Test Data**: Each test creates its own data
2. **Database Seeding**: Predefined test datasets for consistent testing
3. **Cleanup**: Automatic cleanup between tests
4. **Factories**: Test data factories for consistent object creation

### Implementation
```typescript
// Test data factory
export const createTestBook = (overrides = {}) => ({
  title: 'Test Book',
  author: 'Test Author',
  description: 'Test Description',
  genre: 'Fiction',
  ...overrides,
});

// Database seeding
beforeEach(async () => {
  await sql`TRUNCATE books, users RESTART IDENTITY CASCADE`;
  await seedTestData();
});
```

## 🔄 Flaky Test Management

### Detection
- **Retry Strategy**: Automatic retry on CI (max 2 retries)
- **Monitoring**: Track test success rates over time
- **Quarantine**: Mark consistently failing tests for investigation

### Mitigation
- **Wait Strategies**: Explicit waits instead of sleep
- **Test Isolation**: Ensure tests don't depend on each other
- **Deterministic Data**: Use fixed test data instead of random values

```typescript
// Good: Explicit wait
await page.waitForSelector('[data-testid="book-list"]');

// Bad: Arbitrary timeout
await page.waitForTimeout(5000);
```

## ⚡ Performance Optimization

### Parallelization
- **Test Splitting**: Tests run in parallel across multiple workers
- **Matrix Strategy**: Multiple environments/browsers tested simultaneously
- **Selective Testing**: Only run relevant tests based on changed files

### Caching Strategy
- **Dependencies**: Cache node_modules between runs
- **Build Artifacts**: Cache build outputs
- **Test Results**: Cache test results for unchanged code

### Selective Test Execution
```yaml
# Run only relevant tests based on changed files
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v35
  
- name: Run unit tests
  if: contains(steps.changed-files.outputs.all_changed_files, 'app/')
  run: npm run test:unit
```

## 🚪 Deployment Promotion Criteria

### Development → Staging
- ✅ All unit tests pass
- ✅ All component tests pass
- ✅ Linting and formatting checks pass
- ✅ Security scan passes (no high/critical vulnerabilities)

### Staging → Production
- ✅ All integration tests pass
- ✅ E2E tests pass on staging environment
- ✅ Performance tests meet thresholds
- ✅ Accessibility tests pass
- ✅ Manual approval (optional)
- ✅ Load tests complete successfully

### Rollback Triggers
- ❌ Post-deployment smoke tests fail
- ❌ Error rate exceeds 5% in first 10 minutes
- ❌ Response time degrades by >50%
- ❌ Manual rollback request

## 📈 Monitoring & Alerting

### Metrics Tracked
- **Test Success Rate**: Percentage of passing test runs
- **Build Duration**: Time from commit to deployment
- **Coverage Trends**: Code coverage over time
- **Performance Regression**: Core Web Vitals trends

### Alerting Thresholds
- **Test Failures**: >10% failure rate
- **Build Time**: >15 minutes total pipeline time
- **Coverage Drop**: >5% decrease in coverage
- **Performance**: >20% regression in Core Web Vitals

## 🔐 Security Considerations

### Secrets Management
- All sensitive data stored in GitHub Secrets
- Principle of least privilege for API tokens
- Regular rotation of credentials

### Code Scanning
- **SAST**: Static Application Security Testing with CodeQL
- **Dependency Scanning**: Automated vulnerability detection
- **Container Scanning**: Docker image vulnerability assessment

### Compliance
- **Data Privacy**: No real user data in test environments
- **Access Control**: Role-based access to production deployments
- **Audit Trail**: Complete deployment history and approval records

## 🚀 Getting Started

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Test Database**
   ```bash
   # Start PostgreSQL locally or use Docker
   docker run -d --name test-postgres -e POSTGRES_PASSWORD=test_password -e POSTGRES_USER=test_user -e POSTGRES_DB=test_db -p 5432:5432 postgres:15
   
   # Run migrations
   npm run db:migrate:test
   
   # Seed test data
   npm run db:seed:test
   ```

3. **Run Tests Locally**
   ```bash
   # Unit tests
   npm run test:unit
   
   # Integration tests
   npm run test:integration
   
   # E2E tests
   npm run test:e2e
   
   # All tests
   npm test
   ```

4. **Setup CI/CD**
   - Configure GitHub repository secrets
   - Enable GitHub Actions
   - Configure Cloudflare Workers deployment

### Local Development

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linting and formatting
npm run lint:fix
npm run format
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing Guide](https://playwright.dev/)
- [Cloudflare Workers Testing](https://developers.cloudflare.com/workers/testing/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [k6 Load Testing](https://k6.io/docs/)

## 🤝 Contributing

1. All code changes require tests
2. Tests must pass before merging
3. Follow the established patterns for test organization
4. Update documentation for new testing strategies

---

This comprehensive testing strategy ensures high-quality, reliable deployments while maintaining developer productivity and system reliability.