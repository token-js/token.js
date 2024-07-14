import { execSync } from 'child_process'
import esbuild from 'esbuild'

const build = async () => {
  await Promise.all([
    // declaration only typescript build
    execSync('pnpm tsc -p tsconfig.json'),

    // bundle for esm
    esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      minify: true,
      format: 'esm',
      outfile: `./dist/index.js`,
      platform: 'node',
      treeShaking: true,
    }),

    // bundle for commonjs
    esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      minify: true,
      format: 'cjs',
      outfile: `./dist/index.cjs`,
      platform: 'node',
      treeShaking: true,
    }),
  ])
}

build()
