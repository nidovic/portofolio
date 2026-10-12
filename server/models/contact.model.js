import mongoose from 'mongoose'

const contactSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, minlength: 1, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  phone: { type: String, required: true, trim: true, maxlength: 40 },
  message: { type: String, required: true, trim: true, minlength: 3, maxlength: 5000 },
}, { timestamps: true })

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema)