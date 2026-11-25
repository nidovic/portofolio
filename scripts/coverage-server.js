import { spawnSync } from 'node:child_process'

if (!process.env.MONGODB_URI || process.env.MONGODB_DB_NAME !== 'PortfolioE2E') {
  throw new Error('Set MONGODB_URI and MONGODB_DB_NAME=PortfolioE2E explicitly for isolated coverage tests.')
}

for (const args of [
  ['--test', 'tests/date-range.test.js', 'tests/server-errors.test.js'],
  ['scripts/test-api.js'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
