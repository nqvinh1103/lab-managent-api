module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/app.ts',
    '!src/config/**',
    '!src/docs/**'
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', 'src/type.d.ts', 'src/index.ts', 'src/app.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          isolatedModules: true
        },
        diagnostics: {
          ignoreCodes: ['TS151002']
        }
      }
    ]
  },
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
}
