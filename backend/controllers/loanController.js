const Loan = require('../models/Loan')
const Book = require('../models/Book')

const LOAN_DAYS = 14

// @desc    Obtener préstamos (admin ve todos, lector ve los suyos)
// @route   GET /api/loans
// @access  Privado
exports.getLoans = async (req, res, next) => {
  try {
    const { status, search = '', page = '1', limit = '8' } = req.query
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id }
    if (status) filter.status = status

    const loansBase = await Loan.find(filter)
      .populate('book', 'title author isbn cover')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    const term = search.toLowerCase()
    const filteredLoans = loansBase.filter((loan) => {
      const matchesSearch =
        !term ||
        loan.user?.name?.toLowerCase().includes(term) ||
        loan.book?.title?.toLowerCase().includes(term)
      return matchesSearch
    })

    const pageNumber = Math.max(1, parseInt(page, 10) || 1)
    const limitNumber = Math.min(20, Math.max(1, parseInt(limit, 10) || 8))
    const skip = (pageNumber - 1) * limitNumber
    const loans = filteredLoans.slice(skip, skip + limitNumber)

    const counts = filteredLoans.reduce(
      (acc, loan) => {
        acc[loan.status] = (acc[loan.status] || 0) + 1
        return acc
      },
      { activo: 0, atrasado: 0, devuelto: 0 },
    )

    const totalPages = Math.ceil(filteredLoans.length / limitNumber)

    res.status(200).json({
      success: true,
      count: loans.length,
      page: pageNumber,
      limit: limitNumber,
      totalItems: filteredLoans.length,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      counts,
      loans,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Crear un préstamo (reservar/prestar un libro)
// @route   POST /api/loans
// @access  Privado
exports.createLoan = async (req, res, next) => {
  try {
    const { bookId, userId, loanDate, dueDate: dueDateInput, notes } = req.body

    const book = await Book.findById(bookId)
    if (!book) return res.status(404).json({ success: false, message: 'Libro no encontrado' })
    if (book.available < 1) {
      return res.status(400).json({ success: false, message: 'No hay ejemplares disponibles de este libro' })
    }

    // Un lector solo puede solicitar préstamos para sí mismo; el admin puede asignarlos a cualquier usuario
    const targetUser = req.user.role === 'admin' && userId ? userId : req.user._id

    let dueDate = dueDateInput ? new Date(dueDateInput) : null
    if (!dueDate || Number.isNaN(dueDate.getTime())) {
      dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + LOAN_DAYS)
    }

    const loan = await Loan.create({
      book: book._id,
      user: targetUser,
      ...(loanDate ? { loanDate: new Date(loanDate) } : {}),
      dueDate,
      notes: notes || '',
    })

    book.available -= 1
    await book.save()

    const populated = await loan.populate([
      { path: 'book', select: 'title author isbn cover' },
      { path: 'user', select: 'name email' },
    ])

    res.status(201).json({ success: true, loan: populated })
  } catch (error) {
    next(error)
  }
}

// @desc    Registrar la devolución de un préstamo
// @route   PUT /api/loans/:id/return
// @access  Privado
exports.returnLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
    if (!loan) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' })

    if (req.user.role !== 'admin' && String(loan.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'No tiene permiso para modificar este préstamo' })
    }

    if (loan.status === 'devuelto') {
      return res.status(400).json({ success: false, message: 'Este préstamo ya fue devuelto' })
    }

    const { returnDate, condition } = req.body
    const parsedReturnDate = returnDate ? new Date(returnDate) : new Date()

    loan.status = 'devuelto'
    loan.returnDate = Number.isNaN(parsedReturnDate.getTime()) ? new Date() : parsedReturnDate
    if (condition) loan.bookCondition = condition
    await loan.save()

    const book = await Book.findById(loan.book)
    if (book) {
      book.available = Math.min(book.available + 1, book.stock)
      await book.save()
    }

    res.status(200).json({ success: true, loan })
  } catch (error) {
    next(error)
  }
}

// @desc    Eliminar un registro de préstamo
// @route   DELETE /api/loans/:id
// @access  Privado (admin)
exports.deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id)
    if (!loan) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' })

    // Si se elimina un préstamo activo, se libera el ejemplar
    if (loan.status === 'activo') {
      const book = await Book.findById(loan.book)
      if (book) {
        book.available = Math.min(book.available + 1, book.stock)
        await book.save()
      }
    }

    await loan.deleteOne()
    res.status(200).json({ success: true, message: 'Préstamo eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}