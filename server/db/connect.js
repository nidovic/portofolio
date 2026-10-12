import mongoose from 'mongoose'
import config from '../../config/config.js'

export async function connectDatabase() {
  if (!config.mongoUri) {
    throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.')
  }

  await mongoose.connect(config.mongoUri, { dbName: config.mongoDbName })
  console.info(`Connected to MongoDB database "${config.mongoDbName}".`)
  return mongoose.connection
}