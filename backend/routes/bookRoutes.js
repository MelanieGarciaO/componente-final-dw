const express = require('express')
const { body } = require('express-validator')
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')

const router = express.Router()
const upload = require('../middleware/upload')

const bookValidation = [
  body('isbn').trim().notEmpty().withMessage('El ISBN es obligatorio'),
  body('title').trim().notEmpty().withMessage('El título es obligatorio'),
  body('author').trim().notEmpty().withMessage('El autor es obligatorio'),
  body('category').trim().notEmpty().withMessage('La categoría es obligatoria'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número mayor o igual a 0'),
]

router.use(protect) // Todas las rutas de libros requieren autenticación

router.get('/', getBooks)
router.get('/:id', getBook)
router.post('/', authorize('admin'), upload.single('coverFile'), bookValidation, validate, createBook)
router.put('/:id', authorize('admin'), upload.single('coverFile'), updateBook)
router.delete('/:id', authorize('admin'), deleteBook)

module.exports = router
