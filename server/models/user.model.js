import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
}, {
  timestamps: true,
  toJSON: {
    transform(document, returned) {
      delete returned.passwordHash
      delete returned.__v
      return returned
    },
  },
})

userSchema.virtual('password').set(function setPassword(password) {
  this._plainPassword = password
})

userSchema.pre('validate', async function hashPassword() {
  if (this._plainPassword) {
    this.passwordHash = await bcrypt.hash(this._plainPassword, 12)
    this._plainPassword = undefined
  }
})

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
