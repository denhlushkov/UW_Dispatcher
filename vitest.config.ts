import { defineConfig } from 'vitest/config';

// Test levels (standards/checks.md): unit — co-located *.test.ts, no IO;
// smoke — boots the *built* artifact and probes /health (runs after `npm run build`).
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'smoke',
          include: ['test/smoke/**/*.test.ts'],
          environment: 'node',
          testTimeout: 20_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/app/*.main.ts'],
      reporter: ['text', 'html'],
    },
  },
});
