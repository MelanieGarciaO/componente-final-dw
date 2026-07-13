import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, X, BookOpen } from 'lucide-react'
import api from '../../api/axios'

const CATEGORIES = ['Novela', 'Ciencias', 'Historia', 'Cuento', 'Distopía', 'Filosofía', 'Poesía', 'Técnico']
const EMPTY = { isbn: '', title: '', author: '', category: 'Novela', stock: '1', cover: '', coverFile: null, description: '' }

export default function AdminBooks() {
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const [modal, setModal] = useState(null) // null | 'add' | 'edit'
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const fetchBooks = async (searchTerm = '', pageNumber = 1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/books', { params: { search: searchTerm, page: pageNumber, limit: 8 } })
      setBooks(data.books || [])
      setPage(data.page || 1)
      setTotalPages(data.totalPages || 1)
      setTotalItems(data.totalItems || 0)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los libros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => fetchBooks(search, page), 300)
    return () => clearTimeout(timeout)
  }, [search, page])

  const openAdd = () => { setForm(EMPTY); setError(''); setModal('add') }
  const openEdit = (b) => {
    setSelected(b)
    setForm({ isbn: b.isbn, title: b.title, author: b.author, category: b.category, stock: String(b.stock), cover: b.cover || '', coverFile: null, description: b.description || '' })
    setError('')
    setModal('edit')
  }
  const closeModal = () => setModal(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = new FormData()
      payload.append('isbn', form.isbn)
      payload.append('title', form.title)
      payload.append('author', form.author)
      payload.append('category', form.category)
      payload.append('description', form.description)
      payload.append('stock', form.stock)
      if (form.coverFile) {
        payload.append('coverFile', form.coverFile)
      } else {
        payload.append('cover', form.cover || '')
      }

      if (modal === 'add') {
        await api.post('/books', payload)
      } else {
        await api.put(`/books/${selected._id}`, payload)
      }
      closeModal()
      fetchBooks(search, 1)
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar el libro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (book) => {
    if (!window.confirm(`¿Eliminar "${book.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await api.delete(`/books/${book._id}`)
      fetchBooks(search, 1)
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el libro')
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 border-border text-navy focus:border-gold'

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Gestión de Libros</h2>
          <p className="text-sm text-gray-400">{totalItems} libros registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}
        >
          <Plus size={16} /> Agregar libro
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o ISBN…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none border-border bg-gray-50 text-navy focus:border-gold"
          />
        </div>
      </div>

      {error && !modal && <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
              <tr>
                {['ISBN', 'Título / Autor', 'Categoría', 'Stock', 'Disponibles', 'Estado', 'Acciones'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Cargando libros…</td></tr>
              )}
              {!loading && books.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No se encontraron libros.</td></tr>
              )}
              {!loading && books.map((b, i) => (
                <tr key={b._id} style={{ borderBottom: i < books.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted">{b.isbn}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {b.cover ? (
                        <img src={b.cover} alt={b.title} className="h-16 w-12 rounded-lg object-cover shadow-sm" />
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                          Sin imagen
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-navy">{b.title}</p>
                        <p className="text-xs text-gray-400">{b.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">{b.category}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-navy">{b.stock}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: b.available > 0 ? '#10B981' : '#EF4444' }}>{b.available}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={b.available > 0 ? { background: '#D1FAE5', color: '#065F46' } : { background: '#FEE2E2', color: '#991B1B' }}
                    >
                      {b.available > 0 ? 'Disponible' : 'Agotado'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-blue-50">
                        <Edit2 size={14} className="text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg hover:bg-red-50">
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
          <div className="bg-white rounded-2xl w-full max-w-lg" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-yellow-50">
                  <BookOpen size={18} className="text-gold" />
                </div>
                <h3 className="font-bold text-base text-navy">
                  {modal === 'add' ? 'Agregar Libro' : `Editar: ${selected?.title}`}
                </h3>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-muted" />
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-muted">TÍTULO</label>
                    <input value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted">AUTOR</label>
                    <input value={form.author} onChange={(e) => set('author', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted">ISBN</label>
                    <input value={form.isbn} onChange={(e) => set('isbn', e.target.value)} className={inputCls} required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted">CATEGORÍA</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-muted">STOCK</label>
                    <input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-muted">PORTADA (archivo o URL)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => set('coverFile', e.target.files?.[0] || null)}
                      className={inputCls}
                    />
                    <input
                      value={form.cover}
                      onChange={(e) => set('cover', e.target.value)}
                      className={inputCls + ' mt-3'}
                      placeholder="https://..."
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Puede subir un archivo de imagen o pegar la URL de la portada. Si selecciona un archivo, este tendrá prioridad.
                    </p>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold mb-1.5 text-muted">DESCRIPCIÓN</label>
                    <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls + ' resize-none'} />
                  </div>
                </div>
                {error && <p className="text-xs px-3 py-2 rounded-lg text-red-600 bg-red-50">{error}</p>}
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 border-border text-muted">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}
                >
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
