require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const { errorHandler, notFound } = require('./middleware/errorHandler')
const reportRoutes = require('./routes/reportRoutes')

const authRoutes = require('./routes/authRoutes')
const bookRoutes = require('./routes/bookRoutes')
const userRoutes = require('./routes/userRoutes')
const loanRoutes = require('./routes/loanRoutes')

// Conexión a MongoDB
connectDB()

const app = express()

// Middlewares globales
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API de BiblioSys funcionando correctamente' })
})

// Rutas principales
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/users', userRoutes)
app.use('/api/loans', loanRoutes)
app.use('/api/reports', reportRoutes)

// Manejo de rutas inexistentes y errores
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
