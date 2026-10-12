import mongoose from 'mongoose'
import Contact from '../models/contact.model.js'

const writableFields = ['firstName', 'lastName', 'email', 'phone', 'message']

function pickContactFields(body) {
	return Object.fromEntries(writableFields
		.filter((field) => body[field] !== undefined)
		.map((field) => [field, body[field]]))
}

async function list(req, res) {
	const contacts = await Contact.find().sort({ createdAt: -1 })
	return res.status(200).json(contacts)
}

async function read(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied contact id is invalid.' })
	}
	const contact = await Contact.findById(req.params.id)
	if (!contact) return res.status(404).json({ error: 'Contact not found.' })
	return res.status(200).json(contact)
}

async function create(req, res) {
	const contact = await Contact.create(pickContactFields(req.body))
	return res.status(201).json(contact)
}

async function update(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied contact id is invalid.' })
	}
	const contact = await Contact.findById(req.params.id)
	if (!contact) return res.status(404).json({ error: 'Contact not found.' })
	contact.set(pickContactFields(req.body))
	await contact.save()
	return res.status(200).json(contact)
}

async function remove(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied contact id is invalid.' })
	}
	const contact = await Contact.findByIdAndDelete(req.params.id)
	if (!contact) return res.status(404).json({ error: 'Contact not found.' })
	return res.status(204).end()
}

export default { list, read, create, update, remove }