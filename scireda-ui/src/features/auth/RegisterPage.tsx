import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import { LiveAnnouncer } from '../../components/LiveAnnouncer'

export function RegisterPage() {
  const { register, isRegistering } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [errors, setErrors] = useState<{
    email?: string
    username?: string
    password?: string
    confirm?: string
  }>({})
  const emailRegex = useMemo(() => /.+@.+\..+/, [])
  const inputBase =
    'w-full rounded bg-slate-800 border px-3 py-2 outline-none transition-colors focus:ring-2'
  const normalInput = 'border-slate-700 focus:ring-accent/40 focus:border-accent'
  const errorInput = 'border-red-400 focus:ring-red-400/40 focus:border-red-400'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const nextErrors: typeof errors = {}
    if (!emailRegex.test(email)) nextErrors.email = 'Veuillez saisir un email valide.'
    if (!username || username.length < 3)
      nextErrors.username = "Le nom d'utilisateur doit faire au moins 3 caractères."
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
    if (password.length < 8)
      nextErrors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
    else if (!passwordRegex.test(password))
      nextErrors.password = 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'
    if (password !== confirmPassword)
      nextErrors.confirm = 'Les mots de passe ne correspondent pas.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    try {
      await register({ email, username, password })
      // After registration, redirect to login page since register doesn't return user data
      navigate('/login', { 
        state: { 
          message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' 
        }
      })
    } catch {
      setFormError("Échec de la création du compte")
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Créer un compte</h1>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${inputBase} ${errors.email ? errorInput : normalInput}`}
            required
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="username">Nom d'utilisateur</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? 'username-error' : undefined}
            className={`${inputBase} ${errors.username ? errorInput : normalInput}`}
            required
          />
          {errors.username && (
            <p id="username-error" className="mt-1 text-sm text-red-400">{errors.username}</p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`${inputBase} ${errors.password ? errorInput : normalInput}`}
            required
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
          {password && !errors.password && (
            <div className="mt-2 text-xs text-slate-400">
              <p>Le mot de passe doit contenir :</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li className={password.length >= 8 ? 'text-green-400' : 'text-slate-400'}>Au moins 8 caractères</li>
                <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-slate-400'}>Une minuscule</li>
                <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-400'}>Une majuscule</li>
                <li className={/\d/.test(password) ? 'text-green-400' : 'text-slate-400'}>Un chiffre</li>
                <li className={/[@$!%*?&]/.test(password) ? 'text-green-400' : 'text-slate-400'}>Un caractère spécial (@$!%*?&)</li>
              </ul>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="confirm">Confirmer le mot de passe</label>
          <input
            id="confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!errors.confirm}
            aria-describedby={errors.confirm ? 'confirm-error' : undefined}
            className={`${inputBase} ${errors.confirm ? errorInput : normalInput}`}
            required
          />
          {errors.confirm && (
            <p id="confirm-error" className="mt-1 text-sm text-red-400">{errors.confirm}</p>
          )}
        </div>
        {formError && (
          <>
            <p className="text-red-400 text-sm">{formError}</p>
            <LiveAnnouncer message={formError} priority="assertive" />
          </>
        )}
        <button
          type="submit"
          disabled={isRegistering}
          aria-describedby={isRegistering ? 'register-status' : undefined}
          className="w-full rounded bg-accent text-black py-2 font-medium disabled:opacity-50"
        >
          {isRegistering ? 'Création…' : 'Créer le compte'}
        </button>
        {isRegistering && (
          <div id="register-status" aria-live="polite" className="sr-only">
            Création du compte en cours
          </div>
        )}
      </form>
    </section>
  )
}


