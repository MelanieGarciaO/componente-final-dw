import { useAuth } from '../../context/AuthContext'

const ROLE_LABEL = {
  reader: 'Lector',
  admin: 'Administrador',
}

export default function ReaderProfile() {
  const { user } = useAuth()
  const initials = (user?.name || 'LE').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-[32px] bg-gradient-to-r from-[#1F2A3C] to-[#293850] p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Mi Perfil</p>
        <h1 className="mt-3 text-3xl font-bold">Gestione su información personal</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">Revise sus datos de usuario y mantenga su cuenta al día.</p>
      </div>

      <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#C9A227] text-2xl font-bold text-white">
              {initials}
            </div>
            <div>
              <p className="text-2xl font-semibold text-slate-900">{user?.name}</p>
              <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
              <p className="mt-1 text-sm text-slate-400">{ROLE_LABEL[user?.role] || 'Lector'}</p>
            </div>
          </div>
          <button className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Editar perfil
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Correo electrónico</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{user?.email || '—'}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Cédula</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{user?.cedula || '—'}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Tipo de lector</p>
            <p className="mt-3 text-sm font-medium text-slate-900">
              {user?.tipoLector === 'docente'
                ? 'Docente'
                : user?.tipoLector === 'publico_general'
                ? 'Público general'
                : 'Estudiante'}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Estado</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{user?.status || 'Activo'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
