import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const READER_TYPES = [
  { value: 'estudiante', label: 'Estudiante' },
  { value: 'docente', label: 'Docente' },
  { value: 'publico_general', label: 'Público General' },
]

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    cedula: '',
    telefono: '',
    password: '',
    confirm: '',
    tipoLector: 'estudiante',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      await register(form.name, form.email, form.password, {
        cedula: form.cedula,
        telefono: form.telefono,
        tipoLector: form.tipoLector,
      })
      navigate('/reader/catalog')
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo completar el registro')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50 border-border text-navy focus:border-gold'

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Columna izquierda: identidad de marca */}
      <div
        className="hidden md:flex md:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(160deg, #1F2A3C, #101826)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}
          >
            <BookOpen size={20} color="#fff" />
          </div>
          <p className="font-bold text-lg">BiblioSys</p>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug mb-4">
            "Un libro es un sueño que sostienes en tus manos."
          </h2>
          <p className="text-sm text-white/60">
            Únase a nuestra comunidad de lectores y acceda a todo el catálogo de la biblioteca.
          </p>
        </div>

        <p className="text-xs text-white/40">© {new Date().getFullYear()} BiblioSys — Sistema de Gestión Bibliotecaria</p>
      </div>

      {/* Columna derecha: formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 justify-center md:hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C9A227, #A8861F)' }}
            >
              <BookOpen size={20} color="#fff" />
            </div>
            <p className="text-navy font-bold text-lg">BiblioSys</p>
          </div>

          <h1 className="text-2xl font-bold mb-1 text-navy">Crear cuenta</h1>
          <p className="text-sm mb-8 text-muted">Regístrese como lector para acceder al catálogo</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-navy">Nombre completo</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Su nombre"
                className={inputClass}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-navy">Cédula</label>
                <input
                  type="text"
                  value={form.cedula}
                  onChange={(e) => set('cedula', e.target.value)}
                  placeholder="0000000000"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-navy">Teléfono</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => set('telefono', e.target.value)}
                  placeholder="09********"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-navy">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="usuario@biblioteca.edu"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-navy">Tipo de lector</label>
              <select
                value={form.tipoLector}
                onChange={(e) => set('tipoLector', e.target.value)}
                className={inputClass}
              >
                {READER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-navy">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-navy">Confirmar contraseña</label>
              <input
                type="password"
                value={form.confirm}
                onChange={(e) => set('confirm', e.target.value)}
                placeholder="Repita la contraseña"
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-xs px-3 py-2 rounded-lg text-red-600 bg-red-50">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}
            >
              {loading ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center border-border">
            <p className="text-sm text-muted">
              ¿Ya tiene cuenta?{' '}
              <Link to="/login" className="font-semibold hover:opacity-80 text-gold">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}