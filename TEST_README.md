# Test Order Controller Unit Tests

This document provides a comprehensive guide for the unit tests of the Test Order Controller.

## Overview

The test suite for `testOrder.controller.ts` includes comprehensive unit tests using Jest and TypeScript. It covers all 17 controller functions with multiple test cases for success and error scenarios.

## Test Coverage

### Controllers Tested

1. **createOrder** - Create new test orders
   - ✅ Successful creation with all required fields
   - ✅ Unauthorized access (no user)
   - ✅ Missing required fields (patient_email)
   - ✅ Service errors handling

2. **getOrders** - Retrieve all test orders
   - ✅ Retrieve all orders successfully
   - ✅ Unauthorized access
   - ✅ Database errors handling

3. **getMyTestOrders** - Get authenticated patient's orders
   - ✅ Successfully retrieve patient's orders
   - ✅ Unauthorized access
   - ✅ Patient profile not found (404)

4. **processSampleOrder** - Process blood sample by barcode
   - ✅ Successful sample processing
   - ✅ Unauthorized access
   - ✅ API errors from service

5. **addCommentToOrder** - Add comments to test order
   - ✅ Successfully add comment
   - ✅ Unauthorized access
   - ✅ Comment addition failure

6. **updateCommentInOrder** - Update existing comments
   - ✅ Successfully update comment
   - ✅ Unauthorized access

7. **deleteCommentFromOrder** - Delete comments from order
   - ✅ Successfully delete comment
   - ✅ Unauthorized access

8. **addResultsToOrder** - Add test results to order
   - ✅ Successfully add results
   - ✅ Missing barcode validation
   - ✅ Empty results array validation
   - ✅ Unauthorized access

9. **completeOrder** - Mark test order as complete
   - ✅ Successfully complete order
   - ✅ Unauthorized access

10. **exportOrdersToExcel** - Export orders to Excel
    - ✅ Successfully export to Excel
    - ✅ Unauthorized access
    - ✅ Custom headers set correctly

11. **printOrderToPDF** - Print order to PDF (HTML)
    - ✅ Successfully print order
    - ✅ Unauthorized access

12. **getOrderById** - Get specific order by ID
    - ✅ Successfully retrieve order
    - ✅ Invalid ObjectId format
    - ✅ Order not found (404)
    - ✅ Unauthorized access

13. **updateOrder** - Update test order
    - ✅ Successfully update order
    - ✅ Invalid ObjectId format
    - ✅ Order not found
    - ✅ Unauthorized access

14. **deleteOrder** - Delete test order
    - ✅ Successfully delete order
    - ✅ Invalid ObjectId format
    - ✅ Order not found
    - ✅ Unauthorized access

15. **syncRawTestResultController** - Sync raw test results
    - ✅ Successfully sync results
    - ✅ Invalid raw result ID
    - ✅ Unauthorized access

16. **reviewOrder** - Manual test order review
    - ✅ Successfully review order
    - ✅ Invalid ObjectId format
    - ✅ Unauthorized access

17. **aiPreviewOrder** - Preview AI review
    - ✅ Successfully preview AI review
    - ✅ Invalid ObjectId format
    - ✅ Unauthorized access

18. **aiReviewOrder** - AI-powered test order review
    - ✅ Successfully AI review order
    - ✅ Invalid ObjectId format
    - ✅ Unauthorized access

## Test Structure

### Mock Objects

All dependencies are mocked:

- `testOrderService` - Service functions for test order operations
- `testOrderReviewService` - Service functions for review operations
- `PatientService` - Patient-related operations
- `eventLogHelper` - Event logging
- `response.helper` - Response formatting utilities

### Mock Request/Response

```typescript
// Mock Request object includes:
{
  body: {},
  params: {},
  query: {},
  user: {
    id: ObjectId string,
    email: string,
    roles: string[]
  }
}

// Mock Response object includes:
{
  status: jest.fn(),
  json: jest.fn(),
  send: jest.fn(),
  setHeader: jest.fn()
}
```

## Installation

### 1. Install Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest @types/node
```

### 2. Already Included

Jest configuration files:

- `jest.config.js` - Main Jest configuration
- `jest.setup.ts` - Jest setup and initialization

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests for Specific File

```bash
npm test -- testOrder.controller.test.ts
```

### Run Tests with Coverage

```bash
npm test -- --coverage
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Verbose Output

```bash
npm test -- --verbose
```

## Test File Location

```
src/controllers/testOrder.controller.test.ts
```

## Key Testing Patterns Used

### 1. Authentication Checks

All functions first verify that `req.user` exists. Tests validate this:

```typescript
it('should return 401 when user is not authenticated', async () => {
  const req = createMockRequest({ user: undefined })
  const res = createMockResponse()

  await someController(req, res)

  expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED)
})
```

### 2. Parameter Validation

Tests verify ObjectId format and required field validation:

```typescript
it('should return 400 for invalid ObjectId', async () => {
  const req = createMockRequest({
    params: { id: 'invalid-id' }
  })
  const res = createMockResponse()

  await getOrderById(req, res)

  expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST)
})
```

### 3. Service Integration

Tests verify correct service method calls with proper parameters:

```typescript
await createOrder(req, res)

expect(testOrderService.createTestOrder).toHaveBeenCalledWith(
  { patient_email: 'patient@example.com', instrument_name: 'Instrument1' },
  expect.any(ObjectId)
)
```

### 4. Event Logging

Tests verify that events are logged for audit trails:

```typescript
expect(eventLogHelper.logEvent).toHaveBeenCalled()
```

### 5. Error Handling

Tests verify proper error responses for different scenarios:

```typescript
it('should handle service errors', async () => {
  ;(testOrderService.getAllTestOrders as jest.Mock).mockRejectedValue(new Error('Database error'))

  await getOrders(req, res)

  expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.INTERNAL_SERVER_ERROR)
})
```

## Example Test Case

```typescript
describe('createOrder', () => {
  it('should create a test order successfully', async () => {
    // Arrange
    const req = createMockRequest({
      body: {
        patient_email: 'patient@example.com',
        instrument_name: 'Instrument1'
      }
    })
    const res = createMockResponse()

    const mockTestOrder = {
      _id: new ObjectId(),
      order_number: 'ORD-123456',
      barcode: 'BC-ABC123',
      status: 'pending'
    }

    ;(testOrderService.createTestOrder as jest.Mock).mockResolvedValue({
      success: true,
      data: mockTestOrder
    })

    // Act
    await createOrder(req, res)

    // Assert
    expect(testOrderService.createTestOrder).toHaveBeenCalled()
    expect(eventLogHelper.logEvent).toHaveBeenCalled()
  })
})
```

## Expected Coverage

With this test suite, you should achieve:

- **Line Coverage**: ~90%+
- **Branch Coverage**: ~85%+
- **Function Coverage**: 100%
- **Statement Coverage**: ~90%+

## Common Issues and Solutions

### Issue: Module not found errors

**Solution**: Ensure all mock paths match the actual file structure:

```typescript
jest.mock('../services/testOrder.service')
jest.mock('../utils/response.helper')
```

### Issue: Timeout errors

**Solution**: The jest.config.js sets `testTimeout: 10000`. Adjust if needed:

```typescript
// In jest.config.js
testTimeout: 30000 // Increase if needed
```

### Issue: Mock not working

**Solution**: Clear mocks between tests:

```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Extending Tests

To add tests for new controller functions:

```typescript
describe('newController', () => {
  it('should perform expected action', async () => {
    const req = createMockRequest({
      // Set up request
    })
    const res = createMockResponse()

    // Mock service
    ;(testOrderService.someService as jest.Mock).mockResolvedValue(result)

    await newController(req, res)

    // Verify results
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK)
  })
})
```

## Mocking Strategies

### Mock Service Functions

```typescript
;(testOrderService.createTestOrder as jest.Mock).mockResolvedValue({
  success: true,
  data: mockData
})
```

### Mock Service Errors

```typescript
;(testOrderService.createTestOrder as jest.Mock).mockRejectedValue(new Error('Service error'))
```

### Mock Service to Return null

```typescript
;(testOrderService.getTestOrderById as jest.Mock).mockResolvedValue(null)
```

## Performance Optimization

Tests run efficiently due to:

- Full mocking of external dependencies
- No database connections
- No HTTP requests
- Parallel test execution when possible

## Continuous Integration

These tests are designed for CI/CD pipelines. Add to your CI configuration:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Best Practices

1. **Keep tests independent** - Each test should not depend on others
2. **Clear mock setup** - Reset mocks between tests using `beforeEach`
3. **Descriptive names** - Use clear test names that describe what is being tested
4. **Arrange-Act-Assert** - Follow AAA pattern for test structure
5. **Mock external dependencies** - Avoid real database/API calls
6. **Test edge cases** - Test both happy paths and error scenarios

## References

- [Jest Documentation](https://jestjs.io/)
- [Jest Mock Documentation](https://jestjs.io/docs/mock-functions)
- [TypeScript Testing Guide](https://www.typescriptlang.org/docs/handbook/testing.html)
- [Express Testing Best Practices](https://expressjs.com/en/guide/testing.html)
