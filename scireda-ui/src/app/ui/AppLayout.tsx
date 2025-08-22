import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

export function AppLayout() {
  const { token, user, logout, isLoadingUser } = useAuth()
  const location = useLocation()

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // ignore network errors; client logout handled by useAuth
    }
  }

  // Don't show header on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const isNetworkWorkspace = location.pathname.startsWith('/network/')

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Outlet />
      </div>
    )
  }

  // For network workspace, don't show the header (it has its own)
  if (isNetworkWorkspace) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Outlet />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Skip link for keyboard navigation */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent text-black px-4 py-2 rounded z-50 font-medium"
      >
        Aller au contenu principal
      </a>
      
      <header role="banner" className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-accent">
              Scireda
            </Link>
            
            {token && (
              <nav aria-label="Navigation principale" className="flex items-center gap-4 text-slate-300">
                <Link 
                  to="/networks" 
                  aria-current={location.pathname.startsWith('/networks') ? 'page' : undefined}
                  className={`hover:text-white transition-colors ${
                    location.pathname.startsWith('/networks') ? 'text-accent font-medium' : ''
                  }`}
                >
                  Mes Réseaux
                </Link>
                <Link 
                  to="/me" 
                  aria-current={location.pathname === '/me' ? 'page' : undefined}
                  className={`hover:text-white transition-colors ${
                    location.pathname === '/me' ? 'text-accent font-medium' : ''
                  }`}
                >
                  Mon Profil
                </Link>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-3">
                {isLoadingUser && !user ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-400">Chargement du profil...</span>
                  </div>
                ) : user ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-semibold text-sm">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">
                          {user.username}
                        </span>
                        <span className="text-xs text-slate-400">
                          Connecté
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-slate-300">Connecté</span>
                    </div>
                    <button 
                      onClick={handleLogout} 
                      className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 rounded border border-slate-600 text-white hover:border-accent hover:text-accent transition-colors"
                >
                  Connexion
                </Link>
                <Link 
                  to="/register" 
                  className="px-3 py-1.5 rounded bg-accent hover:bg-accent/80 text-black font-medium transition-colors"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main role="main" id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}


