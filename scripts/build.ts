import esbuild from 'esbuild'

const build = async () => {
  await Promise.all([
    // bundle for esm
    esbuild.build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      minify: true,
      format: 'esm',
      outfile: `./dist/index.js`,
      platform: 'node',
      treeShaking: true,
      tsconfig: 'tsconfig.json',
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
      tsconfig: 'tsconfig.json',
    }),
  ])
}

build()
