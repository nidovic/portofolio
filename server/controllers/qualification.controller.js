import mongoose from 'mongoose'
import Qualification from '../models/qualification.model.js'

const writableFields = [
	'slug', 'title', 'titleFr', 'completionDate', 'description', 'descriptionFr',
	'institution', 'location', 'locationFr',
]

function pickQualificationFields(body) {
	return Object.fromEntries(writableFields
		.filter((field) => body[field] !== undefined)
		.map((field) => [field, body[field]]))
}

async function list(req, res) {
	const qualifications = await Qualification.find().sort({ createdAt: -1 })
	return res.status(200).json(qualifications)
}

async function read(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied qualification id is invalid.' })
	}
	const qualification = await Qualification.findById(req.params.id)
	if (!qualification) return res.status(404).json({ error: 'Qualification not found.' })
	return res.status(200).json(qualification)
}

async function create(req, res) {
	const qualification = await Qualification.create(pickQualificationFields(req.body))
	return res.status(201).json(qualification)
}

async function update(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied qualification id is invalid.' })
	}
	const qualification = await Qualification.findById(req.params.id)
	if (!qualification) return res.status(404).json({ error: 'Qualification not found.' })
	qualification.set(pickQualificationFields(req.body))
	await qualification.save()
	return res.status(200).json(qualification)
}

async function remove(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied qualification id is invalid.' })
	}
	const qualification = await Qualification.findByIdAndDelete(req.params.id)
	if (!qualification) return res.status(404).json({ error: 'Qualification not found.' })
	return res.status(204).end()
}

export default { list, read, create, update, remove }