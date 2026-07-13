const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })
}

const sendUserResponse = (user, statusCode, res) => {
  const token = signToken(user._id)
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      cedula: user.cedula,
      telefono: user.telefono,
      tipoLector: user.tipoLector,
      status: user.status,
    },
  })
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, cedula, telefono, tipoLector } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo' })
    }

    const user = await User.create({
      name,
      email,
      password,
      cedula,
      telefono,
      tipoLector: tipoLector || 'publico_general',
      role: role === 'admin' ? 'reader' : role || 'reader',
    })

    sendUserResponse(user, 201, res)
  } catch (error) {
    next(error)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' })
    }

    if (user.status !== 'activo') {
      return res.status(403).json({
        success: false,
        message:
          user.status === 'suspendido'
            ? 'Su cuenta está suspendida. Contacte al administrador.'
            : 'Su cuenta está desactivada. Contacte al administrador.',
      })
    }

    sendUserResponse(user, 200, res)
  } catch (error) {
    next(error)
  }
}

exports.logout = async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' })
}

exports.getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        cedula: req.user.cedula,
        telefono: req.user.telefono,
        tipoLector: req.user.tipoLector,
        status: req.user.status,
      },
    })
  } catch (error) {
    next(error)
  }
}