// Script para poblar la base de datos con datos de ejemplo.
// Ejecutar con: node seed.js
require('dotenv').config()
const connectDB = require('./config/db')
const User = require('./models/User')
const Book = require('./models/Book')

const run = async () => {
  await connectDB()

  await User.deleteMany()
  await Book.deleteMany()

  await User.create([
    { name: 'Admin Principal', email: 'admin@biblioteca.edu', password: 'admin123', role: 'admin' },
    { name: 'Lector Demo', email: 'lector@biblioteca.edu', password: 'lector123', role: 'reader' },
  ])

  await Book.create([
    { isbn: '978-0307474728', title: 'Cien Años de Soledad', author: 'Gabriel García Márquez', category: 'Novela', stock: 5, available: 5, description: 'Obra cumbre del realismo mágico.' },
    { isbn: '978-0060850524', title: 'Brevísima Historia del Tiempo', author: 'Stephen Hawking', category: 'Ciencias', stock: 3, available: 3, description: 'Un recorrido por el universo y la física moderna.' },
    { isbn: '978-0385333481', title: 'El Aleph', author: 'Jorge Luis Borges', category: 'Cuento', stock: 4, available: 4, description: 'Colección de cuentos fantásticos.' },
    { isbn: '978-0451524935', title: '1984', author: 'George Orwell', category: 'Distopía', stock: 6, available: 6, description: 'Una crítica al totalitarismo.' },
    { isbn: '978-0062316097', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Historia', stock: 4, available: 4, description: 'De animales a dioses.' },
    { isbn: '978-6075573113', title: 'El Quijote', author: 'Miguel de Cervantes', category: 'Novela', stock: 3, available: 3, description: 'La obra cumbre de la literatura española.' },
  ])

  console.log('Datos de ejemplo insertados correctamente.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
