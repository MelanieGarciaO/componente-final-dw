const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      required: [true, 'El ISBN es obligatorio'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'El autor es obligatorio'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    cover: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'El stock no puede ser negativo'],
      default: 1,
    },
    available: {
      type: Number,
      required: true,
      min: [0, 'La disponibilidad no puede ser negativa'],
      default: 1,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Book', bookSchema)
