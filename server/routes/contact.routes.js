import { body, param } from 'express-validator'
import express from 'express'
import contactController from '../controllers/contact.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const createRules = [
  body('firstName').trim().isLength({ min: 1, max: 80 }),
  body('lastName').trim().isLength({ min: 1, max: 80 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').trim().isLength({ min: 7, max: 40 }),
  body('message').trim().isLength({ min: 3, max: 5000 }),
]
const updateRules = [
  body('firstName').optional().trim().isLength({ min: 1, max: 80 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 80 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 7, max: 40 }),
  body('message').optional().trim().isLength({ min: 3, max: 5000 }),
]
const idRule = param('id').isMongoId()

router.get('/', requireAuth, requireAdmin, contactController.list)
router.get('/:id', requireAuth, requireAdmin, idRule, validateRequest, contactController.read)
router.post('/', createRules, validateRequest, contactController.create)
router.put('/:id', requireAuth, requireAdmin, idRule, updateRules, validateRequest, contactController.update)
router.delete('/:id', requireAuth, requireAdmin, idRule, validateRequest, contactController.remove)

export default router