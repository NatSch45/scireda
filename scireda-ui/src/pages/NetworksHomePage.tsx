import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNetworks, useCreateNetwork, useDeleteNetwork } from '../lib/api-hooks';
import { useAuth } from '../features/auth/useAuth';
import { Network } from '../lib/api-types';

export function NetworksHomePage() {
  const { user } = useAuth();
  const { data: networks, isLoading, error } = useNetworks();
  const createNetwork = useCreateNetwork();
  const deleteNetwork = useDeleteNetwork();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNetworkName, setNewNetworkName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateNetwork = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!newNetworkName.trim()) {
      setFormError('Le nom du réseau est requis');
      return;
    }

    if (!user?.id) {
      setFormError('Utilisateur non authentifié');
      return;
    }

    try {
      await createNetwork.mutateAsync({
        name: newNetworkName.trim(),
        userId: user.id,
      });
      setNewNetworkName('');
      setShowCreateForm(false);
    } catch (error: any) {
      setFormError(error.message || 'Erreur lors de la création du réseau');
    }
  };

  const handleDeleteNetwork = async (network: Network) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le réseau "${network.name}" ?`)) {
      return;
    }

    try {
      await deleteNetwork.mutateAsync(network.id);
    } catch (error: any) {
      alert(`Erreur lors de la suppression : ${error.message}`);
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-400">Chargement de vos réseaux...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-400">
          Erreur lors du chargement : {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Mes Réseaux</h1>
        <p className="text-slate-400">
          Sélectionnez un réseau pour accéder à vos notes et dossiers
        </p>
      </div>

      {/* Create Network Button */}
      <div className="mb-8">
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-accent hover:bg-accent/80 text-black font-medium px-6 py-3 rounded-lg transition-colors"
          >
            + Créer un nouveau réseau
          </button>
        ) : (
          <form onSubmit={handleCreateNetwork} className="bg-slate-800 p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-medium text-white mb-4">Nouveau réseau</h3>
            
            <div className="mb-4">
              <label htmlFor="networkName" className="block text-sm text-slate-300 mb-2">
                Nom du réseau
              </label>
              <input
                id="networkName"
                type="text"
                value={newNetworkName}
                onChange={(e) => setNewNetworkName(e.target.value)}
                placeholder="Mon réseau de recherche"
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                autoFocus
              />
            </div>

            {formError && (
              <p className="text-red-400 text-sm mb-4">{formError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={createNetwork.isPending}
                className="bg-accent hover:bg-accent/80 text-black font-medium px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {createNetwork.isPending ? 'Création...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewNetworkName('');
                  setFormError(null);
                }}
                className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Networks Grid */}
      {networks && networks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {networks.map((network) => (
            <div
              key={network.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-accent/50 transition-colors group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-medium text-white group-hover:text-accent transition-colors">
                  {network.name}
                </h3>
                <button
                  onClick={() => handleDeleteNetwork(network)}
                  disabled={deleteNetwork.isPending}
                  className="text-slate-400 hover:text-red-400 transition-colors p-1"
                  title="Supprimer le réseau"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              <div className="text-sm text-slate-400 mb-4">
                <p>Créé le {new Date(network.createdAt).toLocaleDateString('fr-FR')}</p>
                <p>Modifié le {new Date(network.updatedAt).toLocaleDateString('fr-FR')}</p>
              </div>

              <Link
                to={`/network/${network.id}`}
                className="inline-flex items-center text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Ouvrir le réseau
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Aucun réseau trouvé</h3>
          <p className="text-slate-400 mb-6">
            Créez votre premier réseau pour commencer à organiser vos notes et recherches.
          </p>
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-accent hover:bg-accent/80 text-black font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Créer mon premier réseau
            </button>
          )}
        </div>
      )}
    </div>
  );
}
