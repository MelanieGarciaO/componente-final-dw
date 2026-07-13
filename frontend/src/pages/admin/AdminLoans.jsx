import { useEffect, useMemo, useState } from 'react'
import { Search, RotateCcw, Trash2, BookOpen, Plus, X } from 'lucide-react'
import api from '../../api/axios'

const STATUS_STYLE = {
  activo: { background: '#D1FAE5', color: '#065F46', label: 'Activo' },
  devuelto: { background: '#E0E7FF', color: '#3730A3', label: 'Devuelto' },
  atrasado: { background: '#FEE2E2', color: '#991B1B', label: 'Vencido' },
}

const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'activo', label: 'Activo' },
  { value: 'atrasado', label: 'Vencido' },
  { value: 'devuelto', label: 'Devuelto' },
]

export default function AdminLoans() {
  const [loans, setLoans] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [displayModal, setDisplayModal] = useState(false)
  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [newLoan, setNewLoan] = useState({ userId: '', bookId: '' })
  const [savingLoan, setSavingLoan] = useState(false)
  const [loanError, setLoanError] = useState('')

  const fetchLoans = async () => {
    try {
      const { data } = await api.get('/loans')
      setLoans(data.loans)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los préstamos')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data.users || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchBooks = async () => {
    try {
      const { data } = await api.get('/books')
      setBooks(data.books || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchLoans(), fetchUsers(), fetchBooks()])
      setLoading(false)
    }
    load()
  }, [])

  const handleReturn = async (loan) => {
    try {
      await api.put(`/loans/${loan._id}/return`)
      await Promise.all([fetchLoans(), fetchBooks()])
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo registrar la devolución')
    }
  }

  const handleDelete = async (loan) => {
    if (!window.confirm('¿Eliminar este registro de préstamo?')) return
    try {
      await api.delete(`/loans/${loan._id}`)
      await Promise.all([fetchLoans(), fetchBooks()])
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el préstamo')
    }
  }

  const createLoan = async (event) => {
    event.preventDefault()
    setLoanError('')
    setSavingLoan(true)
    try {
      await api.post('/loans', newLoan)
      setDisplayModal(false)
      setNewLoan({ userId: '', bookId: '' })
      await Promise.all([fetchLoans(), fetchBooks()])
    } catch (err) {
      setLoanError(err.response?.data?.message || 'No se pudo registrar el préstamo')
    } finally {
      setSavingLoan(false)
    }
  }

  const filtered = useMemo(
    () =>
      loans.filter((l) => {
        const term = search.toLowerCase()
        const matchesSearch =
          l.user?.name?.toLowerCase().includes(term) || l.book?.title?.toLowerCase().includes(term)
        const matchesFilter = filter === 'all' || l.status === filter
        return matchesSearch && matchesFilter
      }),
    [loans, search, filter]
  )

  const counts = useMemo(
    () => ({
      activo: loans.filter((l) => l.status === 'activo').length,
      atrasado: loans.filter((l) => l.status === 'atrasado').length,
      devuelto: loans.filter((l) => l.status === 'devuelto').length,
    }),
    [loans]
  )

  const cards = [
    { label: 'Activos', value: counts.activo, color: '#10B981' },
    { label: 'Vencidos', value: counts.atrasado, color: '#EF4444' },
    { label: 'Devueltos', value: counts.devuelto, color: '#6366F1' },
  ]

  const availableBooks = books.filter((book) => book.available > 0)
  const readers = users.filter((user) => !user.role || user.role === 'reader')

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Gestión de Préstamos</h2>
          <p className="text-sm text-gray-400">{counts.activo} activos · {counts.atrasado} vencidos</p>
        </div>
        <button
          type="button"
          onClick={() => setDisplayModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1F2A3C] px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> Registrar préstamo
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 flex items-center gap-4" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              <BookOpen size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="bg-white rounded-[28px] p-4 shadow-[0_12px_30px_rgba(31,42,60,0.08)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por usuario o libro…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#C9A227]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  filter === f.value ? 'bg-[#1F2A3C] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgba(31,42,60,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Usuario', 'Libro', 'F. Préstamo', 'F. Devolución', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando préstamos…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay préstamos que coincidan.</td></tr>
              )}
              {!loading && filtered.map((l, i) => {
                const s = STATUS_STYLE[l.status] || STATUS_STYLE.activo
                return (
                  <tr key={l._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-navy">{l.user?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-navy">{l.book?.title || '—'}</p>
                      <p className="text-xs text-gray-400">{l.book?.author}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{new Date(l.loanDate).toLocaleDateString('es-EC')}</td>
                    <td className="px-4 py-3 text-muted">{new Date(l.dueDate).toLocaleDateString('es-EC')}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.background, color: s.color }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {l.status !== 'devuelto' && (
                          <button
                            onClick={() => handleReturn(l)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80"
                            style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                          >
                            <RotateCcw size={13} /> Devolver
                          </button>
                        )}
                        <button onClick={() => handleDelete(l)} className="p-1.5 rounded-lg hover:bg-red-50" title="Eliminar registro">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {displayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1F2A3C] text-white">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.16em] text-slate-400">Registrar préstamo</p>
                  <h2 className="text-lg font-semibold text-slate-900">Nuevo préstamo</h2>
                </div>
              </div>
              <button className="rounded-2xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setDisplayModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createLoan} className="space-y-5 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Usuario</label>
                  <select
                    value={newLoan.userId}
                    onChange={(e) => setNewLoan((prev) => ({ ...prev, userId: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none text-slate-900"
                    required
                  >
                    <option value="">Seleccione un lector</option>
                    {readers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} · {user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Libro</label>
                  <select
                    value={newLoan.bookId}
                    onChange={(e) => setNewLoan((prev) => ({ ...prev, bookId: e.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none text-slate-900"
                    required
                  >
                    <option value="">Seleccione un libro disponible</option>
                    {availableBooks.map((book) => (
                      <option key={book._id} value={book._id}>
                        {book.title} · {book.author}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {loanError && <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{loanError}</div>}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setDisplayModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLoan}
                  className="rounded-2xl bg-[#1F2A3C] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingLoan ? 'Registrando…' : 'Registrar préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}