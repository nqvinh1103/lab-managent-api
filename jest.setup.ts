// Jest setup file for global test configuration
jest.mock('dotenv', () => ({
  config: jest.fn()
}))

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Cannot find module') || args[0].includes('Unknown warning'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
