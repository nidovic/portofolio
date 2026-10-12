import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 180 },
  completionDate: { type: String, trim: true, maxlength: 80, default: '' },
  description: { type: String, required: true, trim: true, minlength: 3, maxlength: 5000 },
  descriptionFr: { type: String, trim: true, maxlength: 5000, default: '' },
  category: { type: String, trim: true, maxlength: 160, default: '' },
  categoryFr: { type: String, trim: true, maxlength: 160, default: '' },
  role: { type: String, trim: true, maxlength: 240, default: '' },
  roleFr: { type: String, trim: true, maxlength: 240, default: '' },
  outcome: { type: String, trim: true, maxlength: 2000, default: '' },
  outcomeFr: { type: String, trim: true, maxlength: 2000, default: '' },
  stack: [{ type: String, trim: true, maxlength: 80 }],
  image: { type: String, trim: true, maxlength: 2048, default: '' },
  imageAlt: { type: String, trim: true, maxlength: 240, default: '' },
  imageAltFr: { type: String, trim: true, maxlength: 240, default: '' },
  imageKind: { type: String, enum: ['photo', 'logo'], default: 'photo' },
  links: [{ type: { type: String, required: true }, url: { type: String, required: true } }],
  sourceUrl: { type: String, trim: true, maxlength: 2048, default: '' },
}, { timestamps: true })

export default mongoose.models.Project || mongoose.model('Project', projectSchema)