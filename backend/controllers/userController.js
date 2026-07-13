const User = require('../models/User')
const Loan = require('../models/Loan')

exports.getUsers = async (req, res, next) => {
  try {
    const { search, tipoLector, role, page = '1', limit = '8' } = req.query
    const filter = {}

    if (role) filter.role = role
    if (tipoLector) filter.tipoLector = tipoLector
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1)
    const limitNumber = Math.min(20, Math.max(1, parseInt(limit, 10) || 8))
    const skip = (pageNumber - 1) * limitNumber

    const [users, totalItems] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNumber).lean(),
      User.countDocuments(filter),
    ])

    const loanCounts = await Loan.aggregate([
      { $group: { _id: '$user', total: { $sum: 1 } } },
    ])
    const countMap = {}
    loanCounts.forEach((c) => { countMap[String(c._id)] = c.total })

    const usersWithCounts = users.map((u) => ({
      ...u,
      loanCount: countMap[String(u._id)] || 0,
    }))

    const totalPages = Math.ceil(totalItems / limitNumber)

    res.status(200).json({
      success: true,
      count: usersWithCounts.length,
      page: pageNumber,
      limit: limitNumber,
      totalItems,
      totalPages,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      users: usersWithCounts,
    })
  } catch (error) {
    next(error)
  }
}

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    res.status(200).json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, cedula, telefono, tipoLector, status } = req.body
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese correo' })
    }
    const user = await User.create({ name, email, password, role, cedula, telefono, tipoLector, status })
    res.status(201).json({
      success: true,
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
  } catch (error) {
    next(error)
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })

    const { name, email, role, cedula, telefono, tipoLector, status } = req.body
    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (role !== undefined) user.role = role
    if (cedula !== undefined) user.cedula = cedula
    if (telefono !== undefined) user.telefono = telefono
    if (tipoLector !== undefined) user.tipoLector = tipoLector
    if (status !== undefined) user.status = status

    await user.save()
    res.status(200).json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' })

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'No puede eliminar su propia cuenta' })
    }

    await user.deleteOne()
    res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' })
  } catch (error) {
    next(error)
  }
}