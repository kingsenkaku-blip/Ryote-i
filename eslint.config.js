// ESLint 9 flat config for SDK 54 (eslint-config-expo 10.x)
const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', 'design_handoff_ryote_i/*', '.expo/*'],
  },
];
