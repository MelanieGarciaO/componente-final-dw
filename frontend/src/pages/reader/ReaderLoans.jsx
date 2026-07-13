import { useEffect, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import api from '../../api/axios'

const STATUS_STYLE = {
  activo: { background: '#EFF6FF', color: '#1D4ED8', label: 'Activo' },
  devuelto: { background: '#D1FAE5', color: '#065F46', label: 'Devuelto' },
  atrasado: { background: '#FEE2E2', color: '#991B1B', label: 'Atrasado' },
}

export default function ReaderLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/loans')
      setLoans(data.loans)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLoans() }, [])

  const handleReturn = async (loan) => {
    try {
      await api.put(`/loans/${loan._id}/return`)
      fetchLoans()
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo registrar la devolución')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-navy">Mis Préstamos</h2>
        <p className="text-sm text-gray-400">Historial y préstamos activos de su cuenta</p>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-10">Cargando…</p>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
          <p className="text-muted">Aún no tiene préstamos. Visite el catálogo para solicitar uno.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((l) => {
            const s = STATUS_STYLE[l.status] || STATUS_STYLE.activo
            return (
              <div key={l._id} className="bg-white rounded-2xl p-4 flex items-center justify-between gap-4" style={{ boxShadow: '0 2px 12px rgba(31,42,60,0.07)' }}>
                <div>
                  <p className="font-semibold text-navy">{l.book?.title}</p>
                  <p className="text-xs text-gray-400">{l.book?.author}</p>
                  <p className="text-xs text-muted mt-1">
                    Prestado: {new Date(l.loanDate).toLocaleDateString('es-EC')} · Vence: {new Date(l.dueDate).toLocaleDateString('es-EC')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.background, color: s.color }}>
                    {s.label}
                  </span>
                  {l.status === 'activo' && (
                    <button onClick={() => handleReturn(l)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg, #1F2A3C, #2A3A52)' }}>
                      <RotateCcw size={13} /> Devolver
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
