import path from "path";
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from "vitest/config";
import dotenv from 'dotenv'
dotenv.config()
const aliases = ['infraestructure', 'domain', 'application'];

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: aliases.map((alias) => ({
      find: `@${alias}`,
      replacement: path.resolve(__dirname, `src/${alias}`),
    })),
  },
  test: {
    environment: 'node',
    globals: true,
    exclude: [
      '**/*.e2e-spec.ts',
      '**/prisma/**',
      '**/dist/**',
      '**/node_modules/**',
      '**.module.ts',
    ],
    coverage: {
      provider: 'v8',
      exclude: [
        '*/*.ts',
        'prisma',
        ...configDefaults.exclude,
      ],
    },
  },
});
