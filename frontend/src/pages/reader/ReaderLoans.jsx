import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import api from '../../api/axios'

const STATUS_STYLE = {
  activo: { background: '#EFF6FF', color: '#1D4ED8', label: 'Activo' },
  devuelto: { background: '#D1FAE5', color: '#065F46', label: 'Devuelto' },
  atrasado: { background: '#FEE2E2', color: '#991B1B', label: 'Vencido' },
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

  const counts = useMemo(
    () => ({
      activo: loans.filter((loan) => loan.status === 'activo').length,
      atrasado: loans.filter((loan) => loan.status === 'atrasado').length,
      devuelto: loans.filter((loan) => loan.status === 'devuelto').length,
    }),
    [loans]
  )

  const summaryCards = [
    { label: 'Activos', value: counts.activo, color: '#1D4ED8', bg: '#EFF6FF' },
    { label: 'Vencidos', value: counts.atrasado, color: '#991B1B', bg: '#FEE2E2' },
    { label: 'Devueltos', value: counts.devuelto, color: '#065F46', bg: '#D1FAE5' },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-gradient-to-r from-[#1F2A3C] to-[#293850] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Préstamos</p>
        <h1 className="mt-3 text-3xl font-bold">Mis Préstamos</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">Gestiona tus préstamos y controla las fechas de devolución con facilidad.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
            <p className="mt-4 text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-slate-500 py-16">Cargando…</p>
      ) : loans.length === 0 ? (
        <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Aún no tiene préstamos. Visite el catálogo para solicitar uno.
        </div>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const status = STATUS_STYLE[loan.status] || STATUS_STYLE.activo
            return (
              <div key={loan._id} className="rounded-[28px] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{loan.book?.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{loan.book?.author}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold" style={{ background: status.background, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Prestado</p>
                    <p className="mt-2 text-sm text-slate-700">{new Date(loan.loanDate).toLocaleDateString('es-EC')}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Vence</p>
                    <p className="mt-2 text-sm text-slate-700">{new Date(loan.dueDate).toLocaleDateString('es-EC')}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Usuario</p>
                    <p className="mt-2 text-sm text-slate-700">{loan.user?.name || loan.user?.email || '—'}</p>
                  </div>
                </div>
                {loan.status === 'activo' && (
                  <div className="mt-5 text-right">
                    <button
                      onClick={() => handleReturn(loan)}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#1F2A3C] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      <RotateCcw size={16} /> Registrar devolución
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
