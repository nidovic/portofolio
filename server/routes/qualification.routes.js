import { body, param } from 'express-validator'
import express from 'express'
import qualificationController from '../controllers/qualification.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const createRules = [
  body('title').trim().isLength({ min: 2, max: 180 }),
  body('completionDate').trim().isLength({ min: 2, max: 80 }),
  body('description').trim().isLength({ min: 3, max: 3000 }),
]
const updateRules = [
  body('title').optional().trim().isLength({ min: 2, max: 180 }),
  body('completionDate').optional().trim().isLength({ min: 2, max: 80 }),
  body('description').optional().trim().isLength({ min: 3, max: 3000 }),
]
const idRule = param('id').isMongoId()

router.get('/', qualificationController.list)
router.get('/:id', idRule, validateRequest, qualificationController.read)
router.post('/', requireAuth, requireAdmin, createRules, validateRequest, qualificationController.create)
router.put('/:id', requireAuth, requireAdmin, idRule, updateRules, validateRequest, qualificationController.update)
router.delete('/:id', requireAuth, requireAdmin, idRule, validateRequest, qualificationController.remove)

export default router