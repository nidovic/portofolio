import { body, param } from 'express-validator'
import express from 'express'
import projectController from '../controllers/project.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const createRules = [
  body('title').trim().isLength({ min: 2, max: 180 }),
  body('completionDate').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('description').trim().isLength({ min: 3, max: 5000 }),
  body('sourceUrl').optional({ values: 'falsy' }).isURL({ require_protocol: true }),
]
const updateRules = [
  body('title').optional().trim().isLength({ min: 2, max: 180 }),
  body('completionDate').optional({ values: 'falsy' }).trim().isLength({ max: 80 }),
  body('description').optional().trim().isLength({ min: 3, max: 5000 }),
  body('sourceUrl').optional({ values: 'falsy' }).isURL({ require_protocol: true }),
]
const idRule = param('id').isMongoId()

router.get('/', projectController.list)
router.get('/:id', idRule, validateRequest, projectController.read)
router.post('/', requireAuth, requireAdmin, createRules, validateRequest, projectController.create)
router.put('/:id', requireAuth, requireAdmin, idRule, updateRules, validateRequest, projectController.update)
router.delete('/:id', requireAuth, requireAdmin, idRule, validateRequest, projectController.remove)

export default router