// Jest 設定。
// ユニットテストの対象は「純粋ロジック」（パーサ・通知エンジン）のみです。
// これらは React Native / expo に依存しないため、node 環境 + babel 変換だけで
// 高速に実行できます（型のみの import はビルド時に取り除かれます）。
/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
