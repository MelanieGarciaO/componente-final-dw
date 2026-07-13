import { useEffect, useState } from 'react'
import { Search, RotateCcw, Trash2, BookOpen } from 'lucide-react'
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

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/loans')
      setLoans(data.loans)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los préstamos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLoans() }, [])

  const handleReturn = async (loan) => {
    try {
      await api.put(`/loans/${loan._id}/return`)
      fetchLoans()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo registrar la devolución')
    }
  }

  const handleDelete = async (loan) => {
    if (!window.confirm('¿Eliminar este registro de préstamo?')) return
    try {
      await api.delete(`/loans/${loan._id}`)
      fetchLoans()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el préstamo')
    }
  }

  const filtered = loans.filter((l) => {
    const term = search.toLowerCase()
    const matchesSearch =
      l.user?.name?.toLowerCase().includes(term) || l.book?.title?.toLowerCase().includes(term)
    const matchesFilter = filter === 'all' || l.status === filter
    return matchesSearch && matchesFilter
  })

  const counts = {
    activo: loans.filter((l) => l.status === 'activo').length,
    atrasado: loans.filter((l) => l.status === 'atrasado').length,
    devuelto: loans.filter((l) => l.status === 'devuelto').length,
  }

  const cards = [
    { label: 'Activos', value: counts.activo, color: '#10B981' },
    { label: 'Vencidos', value: counts.atrasado, color: '#EF4444' },
    { label: 'Devueltos', value: counts.devuelto, color: '#6366F1' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy">Gestión de Préstamos</h2>
        <p className="text-sm text-gray-400">{counts.activo} activos · {counts.atrasado} vencidos</p>
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

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por usuario o libro…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none border-border bg-gray-50 text-navy focus:border-gold"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={
                filter === f.value
                  ? { background: '#1F2A3C', color: '#fff' }
                  : { background: '#F1F5F9', color: '#64748B' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
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
    </div>
  )
}