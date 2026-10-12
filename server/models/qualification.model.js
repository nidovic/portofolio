import mongoose from 'mongoose'

const qualificationSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 180 },
  titleFr: { type: String, trim: true, maxlength: 180, default: '' },
  completionDate: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, required: true, trim: true, minlength: 3, maxlength: 3000 },
  descriptionFr: { type: String, trim: true, maxlength: 3000, default: '' },
  institution: { type: String, trim: true, maxlength: 240, default: '' },
  location: { type: String, trim: true, maxlength: 160, default: '' },
  locationFr: { type: String, trim: true, maxlength: 160, default: '' },
}, { timestamps: true })

export default mongoose.models.Qualification || mongoose.model('Qualification', qualificationSchema)