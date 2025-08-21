import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-accent mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Page introuvable</h2>
          <p className="text-slate-400 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/networks"
            className="inline-block bg-accent hover:bg-accent/80 text-black font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Retour aux réseaux
          </Link>
          
          <div className="text-sm">
            <Link
              to="/"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Ou retourner à l'accueil
            </Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-12 opacity-50">
          <svg className="w-24 h-24 mx-auto text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
