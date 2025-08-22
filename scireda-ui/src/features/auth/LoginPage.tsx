import { FormEvent, useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { LiveAnnouncer } from '../../components/LiveAnnouncer'

export function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const inputBase =
    'w-full rounded bg-slate-800 border px-3 py-2 outline-none transition-colors focus:ring-2'
  const normalInput = 'border-slate-700 focus:ring-accent/40 focus:border-accent'
  const errorInput = 'border-red-400 focus:ring-red-400/40 focus:border-red-400'
  const emailRegex = useMemo(() => /.+@.+\..+/, [])

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      // Clear the state to prevent showing the message on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    const nextErrors: { email?: string; password?: string } = {}
    if (!emailRegex.test(email)) nextErrors.email = 'Veuillez saisir un email valide.'
    if (!password) nextErrors.password = 'Veuillez saisir votre mot de passe.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    try {
      await login({ email, password })
      navigate('/networks')
    } catch {
      setFormError('Identifiants invalides')
    }
  }

  return (
    <section className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`${inputBase} ${errors.email ? errorInput : normalInput}`}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-400">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm mb-1" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className={`${inputBase} ${errors.password ? errorInput : normalInput}`}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-400">
              {errors.password}
            </p>
          )}
        </div>
        {successMessage && (
          <div className="bg-green-900/50 border border-green-600 text-green-200 px-4 py-3 rounded">
            {successMessage}
          </div>
        )}
        {formError && (
          <>
            <p className="text-red-400 text-sm">{formError}</p>
            <LiveAnnouncer message={formError} priority="assertive" />
          </>
        )}
        {successMessage && <LiveAnnouncer message={successMessage} />}
        <button
          type="submit"
          disabled={isLoggingIn}
          aria-describedby={isLoggingIn ? 'login-status' : undefined}
          className="w-full rounded bg-accent text-black py-2 font-medium disabled:opacity-50"
        >
          {isLoggingIn ? 'Connexion…' : 'Se connecter'}
        </button>
        {isLoggingIn && (
          <div id="login-status" aria-live="polite" className="sr-only">
            Connexion en cours
          </div>
        )}
      </form>
    </section>
  )
}


