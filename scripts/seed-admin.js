import 'dotenv/config'
import mongoose from 'mongoose'
import config from '../config/config.js'
import { connectDatabase } from '../server/db/connect.js'
import User from '../server/models/user.model.js'

async function seedAdmin() {
  if (!config.adminEmail || !config.adminName || !config.adminPassword) {
    throw new Error('Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD in the local .env file first.')
  }
  if (config.adminPassword.length < 12) {
    throw new Error('ADMIN_PASSWORD must contain at least 12 characters.')
  }

  await connectDatabase()
  const email = config.adminEmail.toLowerCase()
  const existing = await User.findOne({ email })
  if (existing) {
    console.info('Admin account already exists; no changes made.')
    return
  }

  await new User({
    name: config.adminName,
    email,
    password: config.adminPassword,
    role: 'admin',
  }).save()
  console.info(`Admin account created for ${email}; password stored as a bcrypt hash.`)
}

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())