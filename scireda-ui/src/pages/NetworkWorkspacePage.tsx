import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useNetworks, useUpdateNote } from '../lib/api-hooks';
import { FileExplorer } from '../components/FileExplorer';
import { NoteEditor } from '../components/NoteEditor';
import { Note } from '../lib/api-types';

export function NetworkWorkspacePage() {
  const { networkId } = useParams<{ networkId: string }>();
  const networkIdNum = networkId ? parseInt(networkId, 10) : null;
  
  const { data: networks, isLoading: networksLoading, error: networksError } = useNetworks();
  const updateNote = useUpdateNote();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Find the current network
  const currentNetwork = networks?.find(n => n.id === networkIdNum || n.id.toString() === networkId);

  // Auto-save functionality
  const autoSave = useCallback(async (titleOverride?: string, contentOverride?: string) => {
    if (!selectedNote || !hasUnsavedChanges) return;

    try {
      await updateNote.mutateAsync({
        id: selectedNote.id,
        data: {
          title: (titleOverride ?? noteTitle) || 'Note sans titre',
          content: contentOverride ?? noteContent,
          networkId: selectedNote.networkId,
          parentId: selectedNote.parentId,
        }
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
    }
  }, [selectedNote, noteTitle, noteContent, hasUnsavedChanges, updateNote]);

  // Handle note selection
  const handleNoteSelect = (note: Note) => {
    // Save current note if there are unsaved changes
    if (hasUnsavedChanges && selectedNote) {
      autoSave();
    }

    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setHasUnsavedChanges(false);
  };

  // Handle title changes
  const handleTitleChange = (newTitle: string) => {
    setNoteTitle(newTitle);
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout for auto-save with current values
    const timeout = setTimeout(() => {
      autoSave(newTitle, noteContent);
    }, 2000); // Save after 2 seconds of inactivity
    setSaveTimeout(timeout);
  };

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setNoteContent(newContent);
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    // Set new timeout for auto-save with current values
    const timeout = setTimeout(() => {
      autoSave(noteTitle, newContent);
    }, 3000); // Save after 3 seconds of inactivity
    setSaveTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [saveTimeout]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        autoSave();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, autoSave]);

  // Handle invalid network ID
  if (!networkIdNum || isNaN(networkIdNum)) {
    return <Navigate to="/networks" replace />;
  }

  // Loading state
  if (networksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-400">Chargement du réseau...</div>
      </div>
    );
  }

  // Error loading networks
  if (networksError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h1>
          <p className="text-slate-400 mb-4">
            Impossible de charger vos réseaux. Vérifiez votre connexion.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="bg-accent hover:bg-accent/80 text-black font-medium px-4 py-2 rounded transition-colors"
            >
              Réessayer
            </button>
            <Link 
              to="/networks"
              className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
            >
              ← Retour aux réseaux
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Network not found (only after successful loading)
  if (networks && !currentNetwork) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Réseau inaccessible</h1>
          <p className="text-slate-400 mb-6">
            Ce réseau n'existe pas ou vous n'avez pas les permissions pour y accéder.
          </p>
          <Link 
            to="/networks"
            className="inline-flex items-center bg-accent hover:bg-accent/80 text-black font-medium px-4 py-2 rounded-lg transition-colors"
          >
            ← Retour à mes réseaux
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/networks"
              className="text-slate-400 hover:text-white transition-colors"
              title="Retour aux réseaux"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            
            <div>
              <h1 className="text-xl font-semibold text-white">{currentNetwork?.name}</h1>
              <p className="text-sm text-slate-400">
                Réseau de recherche • {currentNetwork?.createdAt ? new Date(currentNetwork.createdAt).toLocaleDateString('fr-FR') : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Save status */}
            {selectedNote && (
              <div className="flex items-center gap-2 text-sm">
                {hasUnsavedChanges ? (
                  <>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-400">Modifications non sauvegardées</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-slate-400">Sauvegardé</span>
                  </>
                )}
              </div>
            )}

            {/* Manual save button */}
            {selectedNote && hasUnsavedChanges && (
              <button
                onClick={() => autoSave()}
                disabled={updateNote.isPending}
                className="bg-accent hover:bg-accent/80 text-black text-sm font-medium px-3 py-1 rounded transition-colors disabled:opacity-50"
              >
                {updateNote.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <FileExplorer
          networkId={networkIdNum}
          onNoteSelect={handleNoteSelect}
          selectedNoteId={selectedNote?.id}
          className="w-80 flex-shrink-0"
        />

        {/* Note Editor */}
        <div className="flex-1 bg-slate-800">
          <NoteEditor
            note={selectedNote || undefined}
            onSave={handleContentChange}
            onTitleChange={handleTitleChange}
            isLoading={updateNote.isPending}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
