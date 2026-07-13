const express = require('express')
const { body } = require('express-validator')
const { getLoans, createLoan, returnLoan, deleteLoan } = require('../controllers/loanController')
const { protect, authorize } = require('../middleware/auth')
const validate = require('../middleware/validate')

const router = express.Router()

router.use(protect) // Requiere sesión iniciada

router.get('/', getLoans)
router.post(
  '/',
  [body('bookId').notEmpty().withMessage('Debe indicar el libro a prestar')],
  validate,
  createLoan
)
router.put('/:id/return', returnLoan)
router.delete('/:id', authorize('admin'), deleteLoan)

module.exports = router
