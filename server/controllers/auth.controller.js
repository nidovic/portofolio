import jwt from 'jsonwebtoken'
import config from '../../config/config.js'
import User from '../models/user.model.js'

function makeToken(user) {
  return jwt.sign({ role: user.role }, config.jwtSecret, {
    subject: String(user._id),
    expiresIn: config.jwtExpiresIn,
  })
}

async function signup(req, res) {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: 'user',
  })
  await user.save()
  return res.status(201).json({ token: makeToken(user), user })
}

async function signin(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+passwordHash')
  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ error: 'Email or password is incorrect.' })
  }
  return res.status(200).json({ token: makeToken(user), user })
}

function signout(req, res) {
  // JWTs are stateless; clients sign out by discarding this access token.
  return res.status(200).json({ message: 'Discard the access token to sign out.' })
}

export default { signup, signin, signout }