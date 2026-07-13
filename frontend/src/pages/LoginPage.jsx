import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/reader/catalog')
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales incorrectas. Intente de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1F2A3C 0%, #151E2B 100%)' }}
      >
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-10" style={{ border: '2px solid #C9A227' }} />
        <div className="absolute top-32 -right-16 w-48 h-48 rounded-full opacity-10" style={{ border: '2px solid #C9A227' }} />
        <div className="absolute -bottom-20 left-20 w-96 h-96 rounded-full opacity-5" style={{ border: '2px solid #C9A227' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}>
            <BookOpen size={24} color="#fff" />
          </div>
          <div>
            <p className="text-white font-bold text-xl leading-tight">BiblioSys</p>
            <p className="text-xs font-medium" style={{ color: '#C9A227' }}>Sistema de Gestión Bibliotecaria</p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="w-10 h-1 rounded mb-6" style={{ background: '#C9A227' }} />
          <blockquote className="text-white/90 text-2xl font-light leading-relaxed mb-4">
            "Una biblioteca es el hospital del alma, donde cada libro es una medicina para el espíritu."
          </blockquote>
          <p className="text-sm font-medium" style={{ color: '#C9A227' }}>— Diodoro de Sicilia</p>
        </div>

        <div className="relative z-10">
          <div className="w-full h-px mb-6 opacity-20" style={{ background: '#C9A227' }} />
          <p className="text-white/40 text-xs">© 2026 BiblioSys · Proyecto Full-Stack</p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#F5F6FA' }}>
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <p className="text-navy font-bold text-lg">BiblioSys</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10" style={{ boxShadow: '0 8px 40px rgba(31,42,60,0.10)' }}>
            <h1 className="text-2xl font-bold mb-1 text-navy">Bienvenido</h1>
            <p className="text-sm mb-8 text-muted">Ingrese sus credenciales para acceder al sistema</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2 text-navy">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="usuario@biblioteca.edu"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-gray-50 border-border text-navy focus:border-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-navy">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 rounded-xl border text-sm outline-none transition-all bg-gray-50 border-border text-navy focus:border-gold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg text-red-600 bg-red-50">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}
              >
                {loading ? 'Ingresando…' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center border-border">
              <p className="text-sm text-muted">
                ¿No tiene cuenta?{' '}
                <Link to="/register" className="font-semibold transition-colors hover:opacity-80 text-gold">
                  Crear cuenta
                </Link>
              </p>
            </div>

            <p className="text-xs text-center mt-4 text-gray-400">
              Demo: admin@biblioteca.edu / admin123 · lector@biblioteca.edu / lector123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
