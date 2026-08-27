// Config de testes unitários — roda contra arquivos "*.spec.ts" dentro de src/, sem infraestrutura externa.
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@campo-em-dia/contracts$': '<rootDir>/../../../libs/contracts/src/index.ts',
  },
};
