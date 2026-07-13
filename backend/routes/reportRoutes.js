const express = require('express')
const {
  getStats,
  getCategoryStats,
  exportBooksExcel,
  exportLoansExcel,
  exportLoansPDF,
  exportUsersExcel,
} = require('../controllers/reportController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.use(protect, authorize('admin')) // Solo el administrador accede a reportes

router.get('/stats', getStats)
router.get('/category-stats', getCategoryStats)
router.get('/books/excel', exportBooksExcel)
router.get('/loans/excel', exportLoansExcel)
router.get('/loans/pdf', exportLoansPDF)
router.get('/users/excel', exportUsersExcel)

module.exports = router