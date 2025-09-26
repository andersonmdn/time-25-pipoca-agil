/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.{test,spec}.ts'],
    exclude: ['dist', 'node_modules'],
    // setupFiles: ['vitest.config.mts'],
    globalSetup: ['./tests/setup/global-setup.ts'],
    pool: 'forks',
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'html', 'lcov'],
      all: false,
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts', '**/*.d.ts'],
    },
  },
})
