import { useState } from 'react'
import { Globe, Bell, Shield, Database } from 'lucide-react'

const STORAGE_KEY = 'bibliosys_settings'

const DEFAULTS = {
  institutionName: 'Universidad Nacional',
  maxLoanDays: 14,
  fineDayAmount: '5.00',
  reminderDays: 3,
  notificationEmail: 'sistema@biblioteca.edu',
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  autoBackup: 'Diario',
  historyRetentionDays: 365,
}

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export default function AdminSettings() {
  const [form, setForm] = useState(loadSettings)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border text-sm outline-none bg-gray-50 border-border text-navy focus:border-gold'
  const labelCls = 'block text-xs font-semibold mb-1.5 text-muted tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-navy">Configuración del Sistema</h2>
        <p className="text-sm text-gray-400">Administre las preferencias generales de BiblioSys</p>
      </div>

      <section className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50">
            <Globe size={16} className="text-blue-600" />
          </div>
          <h3 className="font-bold text-navy">General</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>NOMBRE DE LA INSTITUCIÓN</label>
            <input value={form.institutionName} onChange={(e) => set('institutionName', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>DÍAS MÁXIMOS DE PRÉSTAMO</label>
            <input type="number" min="1" value={form.maxLoanDays} onChange={(e) => set('maxLoanDays', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>MULTA POR DÍA VENCIDO (L.)</label>
            <input type="number" step="0.01" min="0" value={form.fineDayAmount} onChange={(e) => set('fineDayAmount', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-50">
            <Bell size={16} className="text-gold" />
          </div>
          <h3 className="font-bold text-navy">Notificaciones</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>DÍAS PREVIOS PARA RECORDATORIO</label>
            <input type="number" min="0" value={form.reminderDays} onChange={(e) => set('reminderDays', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>CORREO PARA NOTIFICACIONES</label>
            <input type="email" value={form.notificationEmail} onChange={(e) => set('notificationEmail', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50">
            <Shield size={16} className="text-red-500" />
          </div>
          <h3 className="font-bold text-navy">Seguridad</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>SESIÓN EXPIRA EN (MINUTOS)</label>
            <input type="number" min="5" value={form.sessionTimeout} onChange={(e) => set('sessionTimeout', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>INTENTOS MÁXIMOS DE LOGIN</label>
            <input type="number" min="1" value={form.maxLoginAttempts} onChange={(e) => set('maxLoginAttempts', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-50">
            <Database size={16} className="text-green-600" />
          </div>
          <h3 className="font-bold text-navy">Base de Datos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>RESPALDO AUTOMÁTICO</label>
            <select value={form.autoBackup} onChange={(e) => set('autoBackup', e.target.value)} className={inputCls}>
              <option>Diario</option>
              <option>Semanal</option>
              <option>Mensual</option>
              <option>Desactivado</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>RETENCIÓN DE HISTORIAL (DÍAS)</label>
            <input type="number" min="30" value={form.historyRetentionDays} onChange={(e) => set('historyRetentionDays', e.target.value)} className={inputCls} />
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        {saved && <p className="text-xs px-3 py-2 rounded-lg text-green-700 bg-green-50">Cambios guardados</p>}
        <button type="button" onClick={() => setForm(loadSettings())} className="px-5 py-2.5 rounded-xl border text-sm font-semibold hover:bg-gray-50 border-border text-muted">
          Cancelar
        </button>
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}>
          Guardar cambios
        </button>
      </div>
    </form>
  )
}