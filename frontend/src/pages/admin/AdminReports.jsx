import { useEffect, useState } from 'react'
import { FileSpreadsheet, FileText, Download, BarChart3, BookMarked, Users, AlertCircle } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import api from '../../api/axios'

const BAR_COLORS = ['#1F2A3C', '#C9A227', '#1F2A3C', '#C9A227', '#1F2A3C', '#C9A227', '#1F2A3C', '#C9A227']

const REPORTS = [
  {
    id: 'loans-mensual',
    label: 'Préstamos por categoría',
    description: 'Distribución de préstamos por género literario',
    frequency: 'Mensual',
    formats: [{ type: 'excel', url: '/reports/loans/excel', filename: 'prestamos.xlsx' }, { type: 'pdf', url: '/reports/loans/pdf', filename: 'prestamos.pdf' }],
  },
  {
    id: 'users',
    label: 'Usuarios activos',
    description: 'Lectores registrados con tipo y estado de cuenta',
    frequency: 'Mensual',
    formats: [{ type: 'excel', url: '/reports/users/excel', filename: 'usuarios.xlsx' }],
  },
  {
    id: 'books',
    label: 'Inventario general',
    description: 'Estado actual del catálogo y stock disponible',
    frequency: 'Mensual',
    formats: [{ type: 'excel', url: '/reports/books/excel', filename: 'libros.xlsx' }],
  },
]

export default function AdminReports() {
  const [downloading, setDownloading] = useState(null)
  const [categoryStats, setCategoryStats] = useState([])
  const [stats, setStats] = useState({ totalLoans: 0, totalBooks: 0, activeUsers: 0, pendingReturns: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, booksRes, usersRes, loansRes] = await Promise.all([
          api.get('/reports/category-stats'),
          api.get('/books'),
          api.get('/users'),
          api.get('/loans'),
        ])
        setCategoryStats(catRes.data.categoryStats || [])
        const activeUsers = usersRes.data.users.filter((u) => u.role === 'reader' && u.status === 'activo').length
        const pendingReturns = loansRes.data.loans.filter((l) => l.status === 'activo' || l.status === 'atrasado').length
        setStats({
          totalLoans: loansRes.data.count,
          totalBooks: booksRes.data.count,
          activeUsers,
          pendingReturns,
        })
      } catch {
        // silencioso
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExport = async (url, filename) => {
    setDownloading(filename)
    try {
      const res = await api.get(url, { responseType: 'blob' })
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      alert('No se pudo generar el reporte. Intente nuevamente.')
    } finally {
      setDownloading(null)
    }
  }

  const cards = [
    { label: 'Total préstamos', value: stats.totalLoans, icon: BarChart3, color: '#1F2A3C' },
    { label: 'Libros catalogados', value: stats.totalBooks, icon: BookMarked, color: '#C9A227' },
    { label: 'Usuarios activos', value: stats.activeUsers, icon: Users, color: '#10B981' },
    { label: 'Devoluciones pendientes', value: stats.pendingReturns, icon: AlertCircle, color: '#EF4444' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Reportes y Estadísticas</h2>
        <p className="text-sm text-gray-400">Genera y exporta reportes del sistema</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}20` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-navy">{loading ? '…' : value}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <h3 className="font-bold text-navy mb-4">Préstamos por Categoría</h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={categoryStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
              <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" name="Préstamos" radius={[6, 6, 0, 0]}>
                {categoryStats.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {categoryStats.length === 0 && !loading && (
          <p className="text-xs text-gray-400 text-center mt-2">Aún no hay préstamos registrados para graficar.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-navy">Reportes Disponibles</h3>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {REPORTS.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-6 py-4">
                  <p className="font-medium text-navy">{r.label}</p>
                  <p className="text-xs text-gray-400">{r.description}</p>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                    {r.frequency}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {r.formats.map((f) => (
                      <button
                        key={f.filename}
                        onClick={() => handleExport(f.url, f.filename)}
                        disabled={downloading === f.filename}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                        style={{
                          background: f.type === 'excel' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: f.type === 'excel' ? '#10B981' : '#EF4444',
                        }}
                      >
                        {f.type === 'excel' ? <FileSpreadsheet size={15} /> : <FileText size={15} />}
                        {downloading === f.filename ? 'Generando…' : (
                          <>
                            {f.type === 'excel' ? 'Excel' : 'PDF'}
                            <Download size={13} />
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}