module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
    transform: {
        '^.+\\.vue$': 'vue-jest',
        '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: ['/node_modules/(?!gridfinder/)'],
    moduleNameMapper: {
        '^.+\\.(css)$': 'jest-transform-stub',
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testMatch: ['**/tests/**/*.spec.(js|jsx|ts|tsx)'],
    coverageReporters: ['json', 'text', 'html', "cobertura", "lcov"],
    watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
    setupFiles: ['./jest.setup.js'],
};
