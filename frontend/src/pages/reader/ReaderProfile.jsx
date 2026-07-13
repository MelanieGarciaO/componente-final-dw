import { useAuth } from '../../context/AuthContext'

export default function ReaderProfile() {
  const { user } = useAuth()
  const initials = (user?.name || 'LE').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-navy">Mi Perfil</h2>
        <p className="text-sm text-gray-400">Información de su cuenta</p>
      </div>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white" style={{ background: '#C9A227' }}>
            {initials}
          </div>
          <div>
            <p className="font-bold text-lg text-navy">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted">Rol</span>
            <span className="font-medium text-navy">Lector</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted">Correo</span>
            <span className="font-medium text-navy">{user?.email}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
