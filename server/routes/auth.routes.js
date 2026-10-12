import { body } from 'express-validator'
import express from 'express'
import rateLimit from 'express-rate-limit'
import authController from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
})

router.post('/signup', authLimiter, [
  body('name').trim().isLength({ min: 2, max: 120 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8, max: 128 }),
], validateRequest, authController.signup)

router.post('/signin', authLimiter, [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 1, max: 128 }),
], validateRequest, authController.signin)

router.post('/signout', requireAuth, authController.signout)

export default router