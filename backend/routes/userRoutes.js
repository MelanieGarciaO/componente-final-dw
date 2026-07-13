const express = require('express')
const { body } = require('express-validator')
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')

const router = express.Router()

router.use(protect, authorize('admin')) // Solo administradores gestionan usuarios

router.get('/', getUsers)
router.get('/:id', getUser)
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Correo electrónico inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validate,
  createUser
)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

module.exports = router
