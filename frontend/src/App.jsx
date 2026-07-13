import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import api from './api/axios'
import AdminReports from './pages/admin/AdminReports'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBooks from './pages/admin/AdminBooks'
import AdminUsers from './pages/admin/AdminUsers'
import AdminLoans from './pages/admin/AdminLoans'
import AdminSettings from './pages/admin/AdminSettings'

import ReaderLayout from './pages/reader/ReaderLayout'
import ReaderCatalog from './pages/reader/ReaderCatalog'
import ReaderLoans from './pages/reader/ReaderLoans'
import ReaderProfile from './pages/reader/ReaderProfile'

export default function App() {
  const { user, loading } = useAuth()
  const [theme, setTheme] = useState('light')
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        // Intentar cargar del localStorage primero
        const storedTheme = localStorage.getItem('bibliosys_theme')
        if (storedTheme) {
          setTheme(storedTheme)
          document.documentElement.setAttribute('data-theme', storedTheme)
        } else {
          // Si no está en localStorage, cargar del backend
          const { data } = await api.get('/settings')
          if (data?.settings?.theme) {
            setTheme(data.settings.theme)
            document.documentElement.setAttribute('data-theme', data.settings.theme)
            localStorage.setItem('bibliosys_theme', data.settings.theme)
          }
        }
      } catch {
        setTheme('light')
        document.documentElement.setAttribute('data-theme', 'light')
      } finally {
        setAppLoading(false)
      }
    }

    loadTheme()
  }, [])

  const changeTheme = (newTheme) => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  if (loading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-navy font-medium">Cargando…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/reader/catalog'} /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/reader/catalog'} /> : <RegisterPage />}
      />

      {/* Rutas privadas de administrador */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="loans" element={<AdminLoans />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="reports" element={<AdminReports />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Rutas privadas de lector */}
      <Route
        path="/reader"
        element={
          <ProtectedRoute allowedRole="reader">
            <ReaderLayout />
          </ProtectedRoute>
        }
      >
        <Route path="catalog" element={<ReaderCatalog />} />
        <Route path="loans" element={<ReaderLoans />} />
        <Route path="profile" element={<ReaderProfile />} />
        <Route index element={<Navigate to="catalog" replace />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
