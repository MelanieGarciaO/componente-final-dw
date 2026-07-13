import { useEffect, useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import api from '../../api/axios'

export default function ReaderCatalog() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(null)

  const fetchBooks = async (term = '') => {
    setLoading(true)
    try {
      const { data } = await api.get('/books', { params: { search: term } })
      setBooks(data.books)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchBooks(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const requestLoan = async (book) => {
    setRequesting(book._id)
    setMessage('')
    try {
      await api.post('/loans', { bookId: book._id })
      setMessage(`Préstamo solicitado: "${book.title}". Tiene 14 días para devolverlo.`)
      fetchBooks(search)
    } catch (err) {
      setMessage(err.response?.data?.message || 'No se pudo solicitar el préstamo')
    } finally {
      setRequesting(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy">Catálogo de Libros</h2>
        <p className="text-sm text-gray-400">Explore y solicite préstamos de los libros disponibles</p>
      </div>

      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o ISBN…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none border-border bg-gray-50 text-navy focus:border-gold"
          />
        </div>
      </div>

      {message && <p className="text-sm px-4 py-2 rounded-lg bg-yellow-50 text-gold-muted">{message}</p>}

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando catálogo…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl p-5 flex flex-col" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-50">
                  <BookOpen size={20} className="text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-navy truncate">{b.title}</p>
                  <p className="text-xs text-gray-400 truncate">{b.author}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{b.category}</span>
                </div>
              </div>
              {b.description && <p className="text-xs text-muted mb-3 line-clamp-2">{b.description}</p>}
              <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-medium" style={{ color: b.available > 0 ? '#10B981' : '#EF4444' }}>
                  {b.available > 0 ? `${b.available} disponibles` : 'Agotado'}
                </span>
                <button
                  onClick={() => requestLoan(b)}
                  disabled={b.available === 0 || requesting === b._id}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-40 hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}
                >
                  {requesting === b._id ? 'Solicitando…' : 'Solicitar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
