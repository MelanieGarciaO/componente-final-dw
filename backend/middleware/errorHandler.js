// Middleware central de manejo de errores
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  let statusCode = err.statusCode || 500
  let message = err.message || 'Error interno del servidor'

  // ID de Mongo con formato inválido
  if (err.name === 'CastError') {
    statusCode = 400
    message = `Recurso no encontrado con id: ${err.value}`
  }

  // Clave duplicada (ej. email o isbn repetido)
  if (err.code === 11000) {
    statusCode = 400
    const field = Object.keys(err.keyValue)[0]
    message = `Ya existe un registro con ese valor en el campo '${field}'`
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ')
  }

  res.status(statusCode).json({
    success: false,
    message,
  })
}

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` })
}

module.exports = { errorHandler, notFound }
