const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Verifica que el token JWT sea válido y adjunta el usuario a la request
const protect = async (req, res, next) => {
  try {
    let token

    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No autorizado. Token no proporcionado.' })
    }

    // Valida el token (firma y expiración)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
      if (!user || user.status !== 'activo') {
    return res.status(401).json({ success: false, message: 'No autorizado. Cuenta inactiva o no válida.' })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'La sesión ha expirado. Inicie sesión nuevamente.' })
    }
    return res.status(401).json({ success: false, message: 'No autorizado. Token inválido.' })
  }
}

// Restringe el acceso a ciertos roles. Uso: authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user?.role}' no tiene permiso para realizar esta acción.`,
      })
    }
    next()
  }
}

module.exports = { protect, authorize }
