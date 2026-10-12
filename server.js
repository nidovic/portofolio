import 'dotenv/config'
import config from './config/config.js'
import mongoose from 'mongoose'
import app from './server/express.js'
import { connectDatabase } from './server/db/connect.js'

async function startServer() {
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters.')
  }

  await connectDatabase()

  const server = app.listen(config.port, () => {
    console.info(`MyPortfolio API listening on http://localhost:${config.port}`)
  })

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await mongoose.disconnect()
        process.exit(0)
      })
    })
  }

  return server
}

startServer().catch((error) => {
  console.error(`API startup failed: ${error.message}`)
  process.exitCode = 1
})
