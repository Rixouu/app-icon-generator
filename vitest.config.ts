const config = {
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['node_modules/**', '.next/**', 'dist/**', 'build/**'],
  },
};

export default config;
