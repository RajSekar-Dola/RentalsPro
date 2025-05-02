// export default {
//   transform: {
//     '^.+\\.js$': 'babel-jest', // Transpile ES modules
//   },
//   moduleNameMapper: {
//     '^(\\.{1,2}/.*)\\.js$': '$1', // Handle ESM imports without extensions
//   },
//   testEnvironment: 'node', // Suitable for backend/server testing
//   globals: {
//     'jest': {
//       useFakeTimers: true
//     }
//   }
// };
export default {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/tests/backend/**/*.test.js'],
      testEnvironment: 'node',
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/tests/frontend/**/*.test.jsx'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.[jt]sx?$': 'babel-jest',
      },
      extensionsToTreatAsEsm: ['.jsx'],
      moduleFileExtensions: ['js', 'jsx'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
    },
  ],
  globals: {
    jest: {
      useFakeTimers: true,
    },
  },
};
