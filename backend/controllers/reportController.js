const ExcelJS = require('exceljs')
const PDFDocument = require('pdfkit')
const Book = require('../models/Book')
const User = require('../models/User')
const Loan = require('../models/Loan')

// @desc    Estadísticas agregadas para el dashboard (gráficos)
// @route   GET /api/reports/stats
// @access  Privado (admin)
exports.getStats = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
    sixMonthsAgo.setDate(1)
    sixMonthsAgo.setHours(0, 0, 0, 0)

    const loansByMonthRaw = await Loan.aggregate([
      { $match: { loanDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$loanDate' }, month: { $month: '$loanDate' } },
          total: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ])

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

    const loansByMonth = []
    const cursor = new Date(sixMonthsAgo)
    for (let i = 0; i < 6; i++) {
      const year = cursor.getFullYear()
      const month = cursor.getMonth() + 1
      const found = loansByMonthRaw.find((r) => r._id.year === year && r._id.month === month)
      loansByMonth.push({ mes: monthNames[month - 1], total: found ? found.total : 0 })
      cursor.setMonth(cursor.getMonth() + 1)
    }

    const usersByTypeRaw = await User.aggregate([
      { $match: { role: 'reader' } },
      { $group: { _id: '$tipoLector', total: { $sum: 1 } } },
    ])

    const labelMap = {
      estudiante: 'Estudiante',
      docente: 'Docente',
      publico_general: 'Público General',
    }

    const usersByType = usersByTypeRaw.map((r) => ({
      tipo: labelMap[r._id] || 'Público General',
      total: r.total,
    }))

    res.status(200).json({ success: true, loansByMonth, usersByType })
  } catch (error) {
    next(error)
  }
}
// @desc    Préstamos agrupados por categoría de libro (para el gráfico de Reportes)
// @route   GET /api/reports/category-stats
exports.getCategoryStats = async (req, res, next) => {
  try {
    const result = await Loan.aggregate([
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookInfo',
        },
      },
      { $unwind: '$bookInfo' },
      { $group: { _id: '$bookInfo.category', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ])

    const categoryStats = result.map((r) => ({ categoria: r._id, total: r.total }))
    res.status(200).json({ success: true, categoryStats })
  } catch (error) {
    next(error)
  }
}
// @desc    Exportar listado de libros a Excel
// @route   GET /api/reports/books/excel
exports.exportBooksExcel = async (req, res, next) => {
  try {
    const books = await Book.find().sort({ title: 1 })
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Libros')

    sheet.columns = [
      { header: 'ISBN', key: 'isbn', width: 18 },
      { header: 'Título', key: 'title', width: 30 },
      { header: 'Autor', key: 'author', width: 25 },
      { header: 'Categoría', key: 'category', width: 18 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Disponibles', key: 'available', width: 12 },
    ]
    sheet.getRow(1).font = { bold: true }

    books.forEach((b) => {
      sheet.addRow({ isbn: b.isbn, title: b.title, author: b.author, category: b.category, stock: b.stock, available: b.available })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=libros.xlsx')
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}

// @desc    Exportar listado de préstamos a Excel
// @route   GET /api/reports/loans/excel
exports.exportLoansExcel = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('book', 'title').populate('user', 'name email').sort({ loanDate: -1 })
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Préstamos')

    sheet.columns = [
      { header: 'Usuario', key: 'user', width: 25 },
      { header: 'Correo', key: 'email', width: 28 },
      { header: 'Libro', key: 'book', width: 30 },
      { header: 'Fecha préstamo', key: 'loanDate', width: 16 },
      { header: 'Fecha devolución', key: 'returnDate', width: 16 },
      { header: 'Estado', key: 'status', width: 12 },
    ]
    sheet.getRow(1).font = { bold: true }

    loans.forEach((l) => {
      sheet.addRow({
        user: l.user?.name || '—',
        email: l.user?.email || '—',
        book: l.book?.title || '—',
        loanDate: l.loanDate ? l.loanDate.toISOString().slice(0, 10) : '—',
        returnDate: l.returnDate ? l.returnDate.toISOString().slice(0, 10) : 'Pendiente',
        status: l.status,
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=prestamos.xlsx')
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}

// @desc    Exportar listado de préstamos a PDF
// @route   GET /api/reports/loans/pdf
exports.exportLoansPDF = async (req, res, next) => {
  try {
    const loans = await Loan.find().populate('book', 'title').populate('user', 'name email').sort({ loanDate: -1 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=prestamos.pdf')

    const doc = new PDFDocument({ margin: 40, size: 'A4' })
    doc.pipe(res)

    doc.fontSize(18).text('BiblioSys — Reporte de Préstamos', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).fillColor('#666').text(`Generado el ${new Date().toLocaleDateString('es-EC')}`, { align: 'center' })
    doc.moveDown(1.5)

    const tableTop = doc.y
    const colX = { user: 40, book: 190, loanDate: 340, status: 430 }

    doc.fontSize(10).fillColor('#000').font('Helvetica-Bold')
    doc.text('Usuario', colX.user, tableTop)
    doc.text('Libro', colX.book, tableTop)
    doc.text('F. Préstamo', colX.loanDate, tableTop)
    doc.text('Estado', colX.status, tableTop)
    doc.moveDown(0.5)
    doc.font('Helvetica')

    let y = doc.y
    loans.forEach((l) => {
      if (y > 750) {
        doc.addPage()
        y = 40
      }
      doc.text(l.user?.name || '—', colX.user, y, { width: 140 })
      doc.text(l.book?.title || '—', colX.book, y, { width: 140 })
      doc.text(l.loanDate ? l.loanDate.toISOString().slice(0, 10) : '—', colX.loanDate, y, { width: 80 })
      doc.text(l.status, colX.status, y, { width: 100 })
      y += 20
    })

    doc.end()
  } catch (error) {
    next(error)
  }
}

// @desc    Exportar listado de usuarios a Excel
// @route   GET /api/reports/users/excel
exports.exportUsersExcel = async (req, res, next) => {
  try {
    const users = await User.find().sort({ name: 1 })
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Usuarios')

    sheet.columns = [
      { header: 'Nombre', key: 'name', width: 25 },
      { header: 'Correo', key: 'email', width: 28 },
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Tipo de lector', key: 'tipoLector', width: 18 },
      { header: 'Rol', key: 'role', width: 12 },
      { header: 'Estado', key: 'status', width: 12 },
    ]
    sheet.getRow(1).font = { bold: true }

    users.forEach((u) => {
      sheet.addRow({
        name: u.name,
        email: u.email,
        cedula: u.cedula,
        telefono: u.telefono,
        tipoLector: u.tipoLector || '—',
        role: u.role,
        status: u.status === 'activo' ? 'Activo' : u.status === 'suspendido' ? 'Suspendido' : 'Inactivo',
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx')
    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}