import { useEffect, useMemo, useState } from 'react'
import { Search, BookOpen } from 'lucide-react'
import api from '../../api/axios'

export default function ReaderCatalog() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [requesting, setRequesting] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchBooks = async (term = '', pageNumber = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/books', { params: { search: term, page: pageNumber, limit: 6 } })
      setBooks(data.books || [])
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => fetchBooks(search, page), 300)
    return () => clearTimeout(timeout)
  }, [search, page])

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(books.map((book) => book.category).filter(Boolean)))],
    [books]
  )

  const filteredBooks = useMemo(
    () =>
      books.filter((book) => {
        const term = search.toLowerCase()
        const matchesSearch =
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.isbn.toLowerCase().includes(term)
        const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory
        const matchesAvailability = !availableOnly || book.available > 0
        return matchesSearch && matchesCategory && matchesAvailability
      }),
    [books, search, selectedCategory, availableOnly]
  )

  const requestLoan = async (book) => {
    setRequesting(book._id)
    setMessage('')
    try {
      await api.post('/loans', { bookId: book._id })
      setMessage(`Préstamo solicitado: "${book.title}". Tiene 14 días para devolverlo.`)
      fetchBooks(search, page)
    } catch (err) {
      setMessage(err.response?.data?.message || 'No se pudo solicitar el préstamo')
    } finally {
      setRequesting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-gradient-to-r from-[#1F2A3C] to-[#293850] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Catálogo</p>
        <h1 className="mt-3 text-3xl font-bold">Catálogo de Libros</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">Explore nuestra colección de títulos disponibles y solicite préstamos de forma rápida.</p>
      </div>

      <div className="bg-white rounded-[28px] p-6 shadow-sm border border-slate-200">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.7fr]">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[#C9A227]"
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-[#C9A227]"
              />
              Solo disponibles
            </label>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {filteredBooks.length} libros encontrados
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCategory === category
                  ? 'bg-[#1F2A3C] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="rounded-[28px] border border-amber-100 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-center text-slate-500 py-16">Cargando catálogo…</p>
      ) : filteredBooks.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          No se encontraron libros con esos filtros.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="group overflow-hidden rounded-[28px] bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="h-56 overflow-hidden bg-slate-100">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={`Portada ${book.title}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                    <BookOpen size={32} />
                  </div>
                )}
              </div>

              <div className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
                    {book.category}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      book.available > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {book.available > 0 ? `${book.available} disponibles` : 'Agotado'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{book.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{book.author}</p>
                </div>
                {book.description && <p className="text-sm text-slate-500 line-clamp-3">{book.description}</p>}
                <button
                  type="button"
                  onClick={() => requestLoan(book)}
                  disabled={book.available === 0 || requesting === book._id}
                  className="mt-auto inline-flex items-center justify-center rounded-2xl bg-[#1F2A3C] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {requesting === book._id ? 'Solicitando…' : 'Solicitar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">Página {page} de {totalPages} · {totalItems} libros encontrados</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages || loading}
              className="rounded-2xl bg-[#1F2A3C] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
