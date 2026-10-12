import { body, param } from 'express-validator'
import express from 'express'
import userController from '../controllers/user.controller.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()
const createRules = [
	body('name').trim().isLength({ min: 2, max: 120 }),
	body('email').trim().isEmail().normalizeEmail(),
	body('password').isString().isLength({ min: 8, max: 128 }),
	body('role').optional().isIn(['user', 'admin']),
]
const updateRules = [
	body('name').optional().trim().isLength({ min: 2, max: 120 }),
	body('email').optional().trim().isEmail().normalizeEmail(),
	body('password').optional().isString().isLength({ min: 8, max: 128 }),
	body('role').optional().isIn(['user', 'admin']),
]
const idRule = param('id').isMongoId()

router.get('/', requireAuth, requireAdmin, userController.list)
router.get('/:id', requireAuth, requireAdmin, idRule, validateRequest, userController.read)
router.post('/', requireAuth, requireAdmin, createRules, validateRequest, userController.create)
router.put('/:id', requireAuth, requireAdmin, idRule, updateRules, validateRequest, userController.update)
router.delete('/:id', requireAuth, requireAdmin, idRule, validateRequest, userController.remove)

export default router
