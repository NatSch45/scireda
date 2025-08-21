import { useAuth } from '../features/auth/useAuth'

export function MePage() {
  const { user, isLoadingUser } = useAuth()
  if (isLoadingUser) return <div className="p-6">Chargement…</div>
  if (!user) return <div className="p-6">Non connecté</div>
  return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-2">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      <div className="text-slate-300">ID: {user.id}</div>
      <div className="text-slate-300">Email: {user.email}</div>
      <div className="text-slate-300">Username: {user.username}</div>
    </section>
  )
}


