import { useEffect, useState } from 'react'
import { Search, Trash2, Edit2, UserPlus, X } from 'lucide-react'
import api from '../../api/axios'

const EMPTY = { name: '', email: '', password: '', cedula: '', tipoLector: 'estudiante', status: 'activo' }

const TIPO_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'publico_general', label: 'Público General' },
]

const TIPO_LABEL = { estudiante: 'Estudiante', docente: 'Docente', publico_general: 'Público General' }
const TIPO_BADGE = {
  estudiante: { background: '#EFF6FF', color: '#1D4ED8' },
  docente: { background: '#FEF3C7', color: '#92400E' },
  publico_general: { background: '#D1FAE5', color: '#065F46' },
}

const STATUS_LABEL = { activo: 'Activo', inactivo: 'Inactivo', suspendido: 'Suspendido' }
const STATUS_BADGE = {
  activo: { background: '#D1FAE5', color: '#065F46' },
  inactivo: { background: '#F1F5F9', color: '#475569' },
  suspendido: { background: '#FEE2E2', color: '#991B1B' },
}

const initials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const fetchUsers = async (pageNumber = 1, searchTerm = '', tipoValue = 'all') => {
    setLoading(true)
    try {
      const { data } = await api.get('/users', {
        params: { role: 'reader', page: pageNumber, limit: 8, search: searchTerm, tipoLector: tipoValue === 'all' ? '' : tipoValue },
      })
      setUsers(data.users || [])
      setPage(data.page || 1)
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(page, search, tipoFilter), 300)
    return () => clearTimeout(timeout)
  }, [page, search, tipoFilter])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const openAdd = () => { setEditing(null); setForm(EMPTY); setError(''); setModal(true) }
  const openEdit = (u) => {
    setEditing(u)
    setForm({ name: u.name, email: u.email, password: '', cedula: u.cedula || '', tipoLector: u.tipoLector || 'estudiante', status: u.status || 'activo' })
    setError('')
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/users/${editing._id}`, {
          name: form.name,
          email: form.email,
          cedula: form.cedula,
          tipoLector: form.tipoLector,
          status: form.status,
        })
      } else {
        await api.post('/users', { ...form, role: 'reader' })
      }
      setModal(false)
      fetchUsers(1, search, tipoFilter)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.name}"?`)) return
    try {
      await api.delete(`/users/${u._id}`)
      fetchUsers(1, search, tipoFilter)
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el usuario')
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 border-border text-navy focus:border-gold'

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Gestión de Usuarios</h2>
          <p className="text-sm text-gray-400">{totalItems} usuarios registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}
        >
          <UserPlus size={16} /> Nuevo usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 flex flex-col sm:flex-row gap-3" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o correo…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none border-border bg-gray-50 text-navy focus:border-gold"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {TIPO_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setTipoFilter(f.value)
                setPage(1)
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={
                tipoFilter === f.value
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
                {['Usuario', 'Cédula', 'Tipo', 'Préstamos', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Cargando usuarios…</td></tr>}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No se encontraron usuarios.</td></tr>
              )}
              {!loading && users.map((u, i) => (
                <tr key={u._id} style={{ borderBottom: i < users.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#1F2A3C' }}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.cedula || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={TIPO_BADGE[u.tipoLector] || TIPO_BADGE.publico_general}>
                      {TIPO_LABEL[u.tipoLector] || 'Público General'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{u.loanCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={STATUS_BADGE[u.status] || STATUS_BADGE.activo}>
                      {STATUS_LABEL[u.status] || 'Activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50">
                        <Edit2 size={14} className="text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(u)} className="p-1.5 rounded-lg hover:bg-red-50">
                        <Trash2 size={14} className="text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages || loading}
              className="rounded-xl bg-[#1F2A3C] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <h3 className="font-bold text-base text-navy">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => setModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-muted" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted">NOMBRE COMPLETO</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ana García López" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted">CORREO</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ana@correo.com" className={inputCls} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted">CÉDULA</label>
                  <input value={form.cedula} onChange={(e) => set('cedula', e.target.value)} placeholder="0000-0000-00000" className={inputCls} required />
                </div>
                {!editing && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted">CONTRASEÑA</label>
                    <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" className={inputCls} required />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted">TIPO DE LECTOR</label>
                  <select value={form.tipoLector} onChange={(e) => set('tipoLector', e.target.value)} className={inputCls}>
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                    <option value="publico_general">Público General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-muted">ESTADO</label>
                  <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </div>
                {error && <p className="text-xs px-3 py-2 rounded-lg text-red-600 bg-red-50">{error}</p>}
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button type="button" onClick={() => setModal(false)} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 border-border text-muted">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}