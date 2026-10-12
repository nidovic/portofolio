import jwt from 'jsonwebtoken'
import config from '../../config/config.js'
import User from '../models/user.model.js'

export async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'A bearer access token is required.' })
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.sub).select('name email role')
    if (!user) return res.status(401).json({ error: 'The access token is no longer valid.' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'The access token is invalid or expired.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access is required.' })
  }
  return next()
}