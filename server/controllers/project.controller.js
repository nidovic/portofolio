import mongoose from 'mongoose'
import Project from '../models/project.model.js'

const writableFields = [
	'slug', 'title', 'completionDate', 'description', 'descriptionFr', 'category', 'categoryFr',
	'role', 'roleFr', 'outcome', 'outcomeFr', 'stack', 'image', 'imageAlt', 'imageAltFr',
	'imageKind', 'links', 'sourceUrl',
]

function pickProjectFields(body) {
	return Object.fromEntries(writableFields
		.filter((field) => body[field] !== undefined)
		.map((field) => [field, body[field]]))
}

async function list(req, res) {
	const projects = await Project.find().sort({ createdAt: -1 })
	return res.status(200).json(projects)
}

async function read(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied project id is invalid.' })
	}
	const project = await Project.findById(req.params.id)
	if (!project) return res.status(404).json({ error: 'Project not found.' })
	return res.status(200).json(project)
}

async function create(req, res) {
	const project = await Project.create(pickProjectFields(req.body))
	return res.status(201).json(project)
}

async function update(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied project id is invalid.' })
	}
	const project = await Project.findById(req.params.id)
	if (!project) return res.status(404).json({ error: 'Project not found.' })
	project.set(pickProjectFields(req.body))
	await project.save()
	return res.status(200).json(project)
}

async function remove(req, res) {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json({ error: 'The supplied project id is invalid.' })
	}
	const project = await Project.findByIdAndDelete(req.params.id)
	if (!project) return res.status(404).json({ error: 'Project not found.' })
	return res.status(204).end()
}

export default { list, read, create, update, remove }