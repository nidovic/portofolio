import app from '../server/express.js'

if (typeof app.listen !== 'function') {
  throw new Error('The Express application did not load correctly.')
}

console.info('Backend build check passed: Express and all API modules loaded.')