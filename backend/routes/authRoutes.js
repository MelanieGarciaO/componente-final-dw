const express = require('express')
const { body } = require('express-validator')
const { register, login, logout, getMe } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const validate = require('../middleware/validate')

const router = express.Router()

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  register
)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  validate,
  login
)

router.post('/logout', protect, logout)
router.get('/me', protect, getMe)

module.exports = router
