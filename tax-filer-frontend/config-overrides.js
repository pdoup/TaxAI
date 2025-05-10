const { override } = require('customize-cra');

module.exports = override((config) => {
  const jestConfig = config.jest;

  if (jestConfig) {
    jestConfig.transformIgnorePatterns = [
      '/node_modules/(?!(axios|react-markdown)/)',
    ];
  }

  return config;
});
