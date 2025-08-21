import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';

export function HomePage() {
  const { token, user, isLoadingUser } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to networks
  useEffect(() => {
    if (token && user && !isLoadingUser) {
      navigate('/networks', { replace: true });
    }
  }, [token, user, isLoadingUser, navigate]);

  // Show loading while checking auth
  if (token && isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-400">Chargement...</div>
      </div>
    );
  }

  // Show welcome page for unauthenticated users
  return (
    <section className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
          Bienvenue sur Scireda
        </h1>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Organisez vos recherches, gérez vos notes en Markdown et créez des réseaux de connaissances interconnectés.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-accent hover:bg-accent/80 text-black font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="border border-slate-600 hover:border-accent text-white hover:text-accent font-medium px-8 py-3 rounded-lg transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Réseaux de recherche</h3>
          <p className="text-slate-400">
            Créez des espaces dédiés pour organiser vos différents projets de recherche.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Éditeur Markdown</h3>
          <p className="text-slate-400">
            Rédigez et éditez vos notes avec un éditeur Markdown moderne et intuitif.
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5L12 5H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Organisation par dossiers</h3>
          <p className="text-slate-400">
            Structurez vos notes avec un système de dossiers hiérarchique et intuitif.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-slate-800/50 rounded-xl p-8 border border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Prêt à commencer votre recherche ?
        </h2>
        <p className="text-slate-400 mb-6">
          Rejoignez Scireda et transformez votre façon d'organiser vos connaissances.
        </p>
        <Link
          to="/register"
          className="bg-accent hover:bg-accent/80 text-black font-medium px-8 py-3 rounded-lg transition-colors inline-block"
        >
          Créer mon compte gratuit
        </Link>
      </div>
    </section>
  );
}


