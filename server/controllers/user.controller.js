import mongoose from 'mongoose'
import User from '../models/user.model.js'

async function list(req, res) {
  const users = await User.find().sort({ createdAt: -1 })
  return res.status(200).json(users)
}

async function read(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'The supplied user id is invalid.' })
  }
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  return res.status(200).json(user)
}

async function create(req, res) {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role || 'user',
  })
  await user.save()
  return res.status(201).json(user)
}

async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'The supplied user id is invalid.' })
  }
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })

  for (const field of ['name', 'email', 'role']) {
    if (req.body[field] !== undefined) user[field] = req.body[field]
  }
  if (req.body.password) user.password = req.body.password
  await user.save()
  return res.status(200).json(user)
}

async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'The supplied user id is invalid.' })
  }
  if (req.params.id === String(req.user._id)) {
    return res.status(409).json({ error: 'Administrators cannot delete their own account through this route.' })
  }

  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ error: 'User not found.' })
  if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
    return res.status(409).json({ error: 'The last administrator cannot be deleted.' })
  }
  await user.deleteOne()
  return res.status(204).end()
}

export default { list, read, create, update, remove }
