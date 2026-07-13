import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Protege rutas privadas: exige sesión iniciada y, opcionalmente, un rol específico
export default function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-navy font-medium">Cargando…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/reader/catalog'} replace />
  }

  return children
}
