import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BookOpen, LayoutDashboard, Users, BookMarked,
  Settings, LogOut, Menu, X, ChevronRight, Bell, FileBarChart,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/books', label: 'Libros', icon: BookMarked },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/loans', label: 'Préstamos', icon: BookOpen },
  { to: '/admin/reports', label: 'Reportes', icon: FileBarChart },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
]
export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = (user?.name || 'AD').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:static z-30 h-full flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{ width: 256, background: '#1F2A3C', minHeight: '100vh' }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span className="text-white font-bold text-base">BiblioSys</span>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#C9A227' }}>
              {initials}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{user?.name}</p>
              <p className="text-xs" style={{ color: 'rgba(201,162,39,0.8)' }}>Administrador</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={({ isActive }) => ({
                background: isActive ? 'rgba(201,162,39,0.15)' : 'transparent',
                color: isActive ? '#C9A227' : 'rgba(255,255,255,0.6)',
                borderLeft: isActive ? '3px solid #C9A227' : '3px solid transparent',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} />
                  <span>{label}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-6">
          <div className="h-px mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-white/50 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-white border-b border-border" style={{ boxShadow: '0 1px 8px rgba(31,42,60,0.06)' }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} className="text-navy" />
            </button>
            <div>
              <p className="text-xs font-medium text-gray-400">Administración</p>
              <h1 className="text-lg font-bold text-navy">Panel de control</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={20} className="text-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold" />
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-navy">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
