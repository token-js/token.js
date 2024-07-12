const { execSync } = require('child_process')

try {
  // Step 1: Run your Node.js script
  execSync('vite-node ./scripts/docs/generate.ts', { stdio: 'inherit' })

  // Step 2: Check for modified files using Git
  const gitStatus = execSync('git status --porcelain docs').toString()

  if (gitStatus) {
    // Step 3: If there are modifications, throw an error
    throw new Error(
      'Generated documentation files are not up to date. Please run `pnpm docs:update` and commit the changes.'
    )
  } else {
    console.log('Documentation files are up to date.')
  }
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
