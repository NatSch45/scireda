import { Link, useRouteError } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError() as any;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-lg px-4">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-semibold text-white mb-2">
            Oups ! Une erreur s'est produite
          </h1>
          
          <p className="text-slate-400 mb-6">
            {error?.status === 404 
              ? "La page que vous recherchez n'existe pas." 
              : "Quelque chose s'est mal passé. Veuillez réessayer."
            }
          </p>

          {error?.statusText && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Détails de l'erreur :</h3>
              <code className="text-sm text-red-400">{error.statusText}</code>
              {error?.data && (
                <div className="mt-2">
                  <code className="text-xs text-slate-500">{error.data}</code>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="inline-block bg-accent hover:bg-accent/80 text-black font-medium px-6 py-3 rounded-lg transition-colors mr-4"
          >
            Actualiser la page
          </button>
          
          <Link
            to="/networks"
            className="inline-block border border-slate-600 hover:border-accent text-white hover:text-accent font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Retour aux réseaux
          </Link>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>Si le problème persiste, contactez le support technique.</p>
        </div>
      </div>
    </div>
  );
}
