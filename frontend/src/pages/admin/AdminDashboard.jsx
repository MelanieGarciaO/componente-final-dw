import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, Users, BookOpen, CheckCircle, TrendingUp, PlusCircle, UserPlus, FileBarChart } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'
import api from '../../api/axios'

const DONUT_COLORS = { estudiante: '#1F2A3C', docente: '#C9A227', publico_general: '#3B82F6' }
const DONUT_LABEL = { estudiante: 'Estudiante', docente: 'Docente', publico_general: 'Público' }

const STATUS_BADGE = {
  activo: { background: '#D1FAE5', color: '#065F46', label: 'Activo' },
  devuelto: { background: '#E0E7FF', color: '#3730A3', label: 'Devuelto' },
  atrasado: { background: '#FEE2E2', color: '#991B1B', label: 'Vencido' },
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ books: 0, users: 0, activeLoans: 0, available: 0 })
  const [loansByMonth, setLoansByMonth] = useState([])
  const [usersByType, setUsersByType] = useState([])
  const [recentLoans, setRecentLoans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [booksRes, usersRes, loansRes, statsRes, allLoansRes] = await Promise.all([
          api.get('/books'),
          api.get('/users'),
          api.get('/loans', { params: { status: 'activo' } }),
          api.get('/reports/stats'),
          api.get('/loans'),
        ])
        setStats({
          books: booksRes.data.count,
          users: usersRes.data.count,
          activeLoans: loansRes.data.count,
          available: booksRes.data.books.reduce((sum, b) => sum + b.available, 0),
        })
        setLoansByMonth(statsRes.data.loansByMonth || [])
        setUsersByType(statsRes.data.usersByType || [])
        setRecentLoans((allLoansRes.data.loans || []).slice(0, 5))
      } catch {
        // Silencioso: si falla, se muestran los valores en 0
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Libros', value: stats.books, icon: BookMarked, color: '#C9A227' },
    { label: 'Usuarios Registrados', value: stats.users, icon: Users, color: '#3B82F6' },
    { label: 'Préstamos Activos', value: stats.activeLoans, icon: BookOpen, color: '#10B981' },
    { label: 'Libros Disponibles', value: stats.available, icon: CheckCircle, color: '#10B981' },
  ]

  const totalUsersByType = usersByType.reduce((s, u) => s + u.total, 0)

  const typeKeyFromLabel = (tipo) => {
    if (tipo === 'Estudiante') return 'estudiante'
    if (tipo === 'Docente') return 'docente'
    return 'publico_general'
  }

  const quickAccess = [
    { label: 'Nuevo préstamo', icon: PlusCircle, color: '#374151', bg: '#F1F5F9', to: '/admin/loans' },
    { label: 'Registrar libro', icon: BookMarked, color: '#A8861F', bg: '#FEF9E7', to: '/admin/books' },
    { label: 'Nuevo usuario', icon: UserPlus, color: '#1D4ED8', bg: '#EFF6FF', to: '/admin/users' },
    { label: 'Ver reportes', icon: FileBarChart, color: '#059669', bg: '#ECFDF5', to: '/admin/reports' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Dashboard</h2>
        <p className="text-sm text-gray-400">Resumen general del sistema bibliotecario</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-navy">{loading ? '…' : value.toLocaleString('es-EC')}</p>
            <p className="text-sm text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
          <h3 className="font-bold text-navy mb-4">Préstamos por Mes</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={loansByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEE" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total" name="Préstamos" stroke="#1F2A3C" strokeWidth={2.5} dot={{ fill: '#C9A227', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
          <h3 className="font-bold text-navy mb-1">Usuarios por Tipo</h3>
          <p className="text-xs text-gray-400 mb-2">{totalUsersByType} usuarios totales</p>
          <div className="flex items-center gap-4">
            <div style={{ width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={usersByType} dataKey="total" nameKey="tipo" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {usersByType.map((u, i) => (
                      <Cell key={i} fill={DONUT_COLORS[typeKeyFromLabel(u.tipo)]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {usersByType.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[typeKeyFromLabel(u.tipo)] }} />
                    <span className="text-muted">{u.tipo}</span>
                  </div>
                  <span className="font-semibold text-navy">{u.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
          <h3 className="font-bold text-navy mb-4">Accesos Rápidos</h3>
          <div className="space-y-2">
            {quickAccess.map(({ label, icon: Icon, color, bg, to }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{ background: bg, color }}
              >
                {label}
                <span>→</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-navy">Préstamos Recientes</h3>
            <button onClick={() => navigate('/admin/loans')} className="text-xs font-semibold text-gold hover:opacity-80">
              Ver todos →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="py-2 font-semibold text-gray-400 text-xs">Usuario</th>
                  <th className="py-2 font-semibold text-gray-400 text-xs">Libro</th>
                  <th className="py-2 font-semibold text-gray-400 text-xs">F. Devolución</th>
                  <th className="py-2 font-semibold text-gray-400 text-xs">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={4} className="py-6 text-center text-gray-400">Cargando…</td></tr>}
                {!loading && recentLoans.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-gray-400">Aún no hay préstamos registrados.</td></tr>
                )}
                {!loading && recentLoans.map((l) => {
                  const s = STATUS_BADGE[l.status] || STATUS_BADGE.activo
                  return (
                    <tr key={l._id} className="border-b border-border last:border-0">
                      <td className="py-2.5 text-navy font-medium">{l.user?.name || '—'}</td>
                      <td className="py-2.5 text-muted">{l.book?.title || '—'}</td>
                      <td className="py-2.5 text-muted">{new Date(l.dueDate).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="py-2.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.background, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}