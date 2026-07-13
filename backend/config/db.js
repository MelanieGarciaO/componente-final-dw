const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    await mongoose.connect(uri)
    console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`)
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`)
    process.exit(1)
  }
}

module.exports = connectDB
