# Testing Guide

## Overview

This project uses **Jest** for testing. Tests are written in the **backend** codebase, not the frontend.

## Test Structure

```
src/
  ├── __tests__/
  │   ├── utils/
  │   │   └── validation.test.ts      # Validation utility tests
  │   ├── controllers/
  │   │   └── iconController.test.ts   # Controller tests
  │   ├── integration/
  │   │   └── api.test.ts              # API integration tests
  │   ├── promptBuilder.test.ts       # Prompt builder tests
  │   └── replicateClient.test.ts     # Replicate client tests
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

## Test Types

### 1. Unit Tests

Test individual components in isolation:

- **Validation Tests** (`validation.test.ts`)
  - Hex color validation
  - Prompt validation
  - Style ID validation
  - Color array validation

- **Prompt Builder Tests** (`promptBuilder.test.ts`)
  - Prompt construction
  - Color inclusion/exclusion
  - Variation handling

- **Replicate Client Tests** (`replicateClient.test.ts`)
  - API request construction
  - Response handling
  - Error handling
  - Parallel icon generation

- **Controller Tests** (`iconController.test.ts`)
  - Request validation
  - Error handling
  - Response formatting

### 2. Integration Tests

Test API endpoints end-to-end:

- **API Tests** (`api.test.ts`)
  - POST `/api/generate-icons` - success cases
  - POST `/api/generate-icons` - validation errors
  - GET `/health` - health check
  - Error handling middleware

## Writing New Tests

### Example Unit Test

```typescript
import { MyClass } from "../myClass.js";

describe("MyClass", () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  it("should do something", () => {
    const result = instance.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### Example Integration Test

```typescript
import request from "supertest";
import { app } from "../server.js";

describe("API Endpoint", () => {
  it("should return 200 for valid request", async () => {
    const response = await request(app)
      .post("/api/endpoint")
      .send({ data: "value" })
      .expect(200);

    expect(response.body).toHaveProperty("result");
  });
});
```

## Mocking

### Mocking External APIs

```typescript
jest.mock("../replicateClient.js", () => ({
  ReplicateClient: jest.fn().mockImplementation(() => ({
    generateIcons: jest.fn().mockResolvedValue(["url1", "url2"]),
  })),
}));
```

### Mocking Fetch

```typescript
global.fetch = jest.fn();

(global.fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: "value" }),
});
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 80%
- **Functions**: > 80%
- **Lines**: > 80%

## Continuous Integration

Tests should run automatically in CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## Troubleshooting

### Jest not finding modules

Make sure `jest.config.js` has correct `moduleNameMapper` for ES modules.

### TypeScript errors in tests

Ensure `tsconfig.json` includes `"types": ["node", "jest"]`.

### ES Module issues

Use `NODE_OPTIONS=--experimental-vm-modules` in test scripts (already configured).

## Best Practices

1. **Test isolation**: Each test should be independent
2. **Clear test names**: Use descriptive `describe` and `it` blocks
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock external dependencies**: Don't make real API calls in tests
5. **Test edge cases**: Include error scenarios and boundary conditions
6. **Keep tests fast**: Unit tests should run quickly

