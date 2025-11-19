// Jest setup file for global test configuration
jest.mock('dotenv', () => ({
  config: jest.fn()
}))

// Suppress console errors during tests that are expected error handling tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string') {
      // Filter out expected error messages from tests
      const errorString = args[0]
      if (
        errorString.includes('Cannot find module') ||
        errorString.includes('Unknown warning') ||
        errorString.includes('Error fetching test orders') ||
        errorString.includes('Error in processSampleOrder') ||
        errorString.includes('Error in aiPreviewOrder') ||
        errorString.includes('Database error') ||
        errorString.includes('Instrument not ready') ||
        errorString.includes('dynamic import callback')
      ) {
        return
      }
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
