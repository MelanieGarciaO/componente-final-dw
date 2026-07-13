const Book = require('../models/Book')

// @desc    Obtener todos los libros (con búsqueda opcional ?search=)
// @route   GET /api/books
// @access  Privado
exports.getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query
    const filter = {}

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ]
    }
    if (category) filter.category = category

    const books = await Book.find(filter).sort({ createdAt: -1 })
    res.status(200).json({ success: true, count: books.length, books })
  } catch (error) {
    next(error)
  }
}

// @desc    Obtener un libro por id
// @route   GET /api/books/:id
// @access  Privado
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ success: false, message: 'Libro no encontrado' })
    res.status(200).json({ success: true, book })
  } catch (error) {
    next(error)
  }
}

// @desc    Crear un libro
// @route   POST /api/books
// @access  Privado (admin)
exports.createBook = async (req, res, next) => {
  try {
    const { isbn, title, author, category, description, cover, stock } = req.body
    let coverValue = cover
    if (req.file) {
      coverValue = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    }
    const book = await Book.create({
      isbn,
      title,
      author,
      category,
      description,
      cover: coverValue,
      stock,
      available: stock,
    })
    res.status(201).json({ success: true, book })
  } catch (error) {
    next(error)
  }
}

// @desc    Actualizar un libro
// @route   PUT /api/books/:id
// @access  Privado (admin)
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ success: false, message: 'Libro no encontrado' })

    const { isbn, title, author, category, description, cover, stock } = req.body
    let coverValue = cover
    if (req.file) {
      coverValue = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
    }

    // Si cambia el stock, ajustar disponibles manteniendo la cantidad prestada
    if (stock !== undefined && stock !== book.stock) {
      const loaned = book.stock - book.available
      book.stock = stock
      book.available = Math.max(stock - loaned, 0)
    }

    if (isbn !== undefined) book.isbn = isbn
    if (title !== undefined) book.title = title
    if (author !== undefined) book.author = author
    if (category !== undefined) book.category = category
    if (description !== undefined) book.description = description
    if (coverValue !== undefined) book.cover = coverValue

    await book.save()
    res.status(200).json({ success: true, book })
  } catch (error) {
    next(error)
  }
}

// @desc    Eliminar un libro
// @route   DELETE /api/books/:id
// @access  Privado (admin)
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ success: false, message: 'Libro no encontrado' })

    await book.deleteOne()
    res.status(200).json({ success: true, message: 'Libro eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}
