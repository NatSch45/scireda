import { useState, useMemo } from 'react';
import { 
  useTopLevelNotes, 
  useTopLevelFolders,
  useFolderContent,
  useCreateNote, 
  useCreateFolder, 
  useDeleteNote, 
  useDeleteFolder 
} from '../lib/api-hooks';
import { apiClient } from '../lib/api-client-generated';
import { Note, Folder, FolderWithContent } from '../lib/api-types';
import { ConfirmModal } from './ConfirmModal';

interface FileExplorerProps {
  networkId: number;
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: number;
  className?: string;
}

export function FileExplorer({ 
  networkId, 
  onNoteSelect, 
  selectedNoteId, 
  className = '' 
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState<{ type: 'note' | 'folder'; parentId?: number } | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data: topLevelNotes, isLoading: notesLoading, error: notesError } = useTopLevelNotes(networkId);
  const { data: topLevelFolders, isLoading: foldersLoading, error: foldersError } = useTopLevelFolders(networkId);
  
  const createNote = useCreateNote();
  const createFolder = useCreateFolder();
  const deleteNote = useDeleteNote();
  const deleteFolder = useDeleteFolder();

  const isLoading = notesLoading || foldersLoading;
  const error = notesError || foldersError;

  const showConfirm = (config: {
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      isOpen: true,
      ...config,
    });
  };

  const hideConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const toggleFolder = (folderId: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !showCreateForm) return;

    try {
      if (showCreateForm.type === 'note') {
        await createNote.mutateAsync({
          title: newItemName.trim(),
          content: '# ' + newItemName.trim() + '\n\nContenu de la note...',
          networkId,
          parentId: showCreateForm.parentId || null,
        });
      } else {
        await createFolder.mutateAsync({
          name: newItemName.trim(),
          networkId,
          parentId: showCreateForm.parentId || null,
        });
      }
      
      setNewItemName('');
      setShowCreateForm(null);
    } catch (error: any) {
      showConfirm({
        title: 'Erreur de création',
        message: `Erreur lors de la création : ${error.message}`,
        confirmText: 'OK',
        variant: 'default',
        onConfirm: hideConfirm,
      });
    }
  };

  const handleDeleteNote = async (note: Note) => {
    showConfirm({
      title: 'Supprimer la note',
      message: `Êtes-vous sûr de vouloir supprimer la note "${note.title}" ?\n\nCette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteNote.mutateAsync(note.id);
          hideConfirm();
        } catch (error: any) {
          hideConfirm();
          showConfirm({
            title: 'Erreur de suppression',
            message: `Erreur lors de la suppression : ${error.message}`,
            confirmText: 'OK',
            variant: 'default',
            onConfirm: hideConfirm,
          });
        }
      },
    });
  };

  const handleDeleteFolder = async (folder: Folder | FolderWithContent) => {
    let hasContent = false;
    
    // Check if folder has content
    if ('notes' in folder && 'subFolders' in folder) {
      // FolderWithContent - we already have the content
      hasContent = folder.notes.length > 0 || folder.subFolders.length > 0;
    } else {
      // Regular Folder - we need to fetch content to check
      try {
        const folderContent = await apiClient.getFolderContent(folder.id);
        hasContent = folderContent.notes.length > 0 || folderContent.subFolders.length > 0;
      } catch (error) {
        // If we can't fetch content, proceed with standard delete
        console.warn('Could not fetch folder content for deletion check:', error);
      }
    }

    if (hasContent) {
      // Show warning for non-empty folders
      showConfirm({
        title: 'Dossier non vide',
        message: `Le dossier "${folder.name}" contient des éléments.\n\nVoulez-vous le supprimer définitivement avec tout son contenu ?`,
        confirmText: 'Continuer',
        variant: 'danger',
        onConfirm: () => {
          // Second confirmation for force delete
          showConfirm({
            title: '⚠️ Suppression définitive',
            message: `ATTENTION : Cette action est irréversible !\n\nLe dossier "${folder.name}" et tout son contenu seront définitivement supprimés.\n\nConfirmez-vous cette suppression forcée ?`,
            confirmText: 'Supprimer définitivement',
            variant: 'danger',
            onConfirm: async () => {
              try {
                await deleteFolder.mutateAsync({ id: folder.id, params: { force: true } });
                hideConfirm();
              } catch (error: any) {
                hideConfirm();
                showConfirm({
                  title: 'Erreur de suppression',
                  message: `Erreur lors de la suppression : ${error.message}`,
                  confirmText: 'OK',
                  variant: 'default',
                  onConfirm: hideConfirm,
                });
              }
            },
          });
        },
      });
    } else {
      // Standard confirmation for empty folders
      showConfirm({
        title: 'Supprimer le dossier',
        message: `Êtes-vous sûr de vouloir supprimer le dossier "${folder.name}" ?\n\nCette action est irréversible.`,
        confirmText: 'Supprimer',
        variant: 'danger',
        onConfirm: async () => {
          try {
            await deleteFolder.mutateAsync({ id: folder.id });
            hideConfirm();
          } catch (error: any) {
            hideConfirm();
            showConfirm({
              title: 'Erreur de suppression',
              message: `Erreur lors de la suppression : ${error.message}`,
              confirmText: 'OK',
              variant: 'default',
              onConfirm: hideConfirm,
            });
          }
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-slate-400">Chargement de l'explorateur...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-center text-red-400">
          <p className="mb-2">Erreur lors du chargement</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const hasContent = (topLevelFolders && topLevelFolders.length > 0) || (topLevelNotes && topLevelNotes.length > 0);

  return (
    <div className={`bg-slate-900 border-r border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="font-semibold text-white mb-3">Explorateur</h2>
        
        {/* Create buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateForm({ type: 'folder' })}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
            title="Nouveau dossier"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Dossier
          </button>
          
          <button
            onClick={() => setShowCreateForm({ type: 'note' })}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition-colors"
            title="Nouvelle note"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Note
          </button>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <form onSubmit={handleCreateItem} className="mt-3 space-y-2">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Nom ${showCreateForm.type === 'note' ? 'de la note' : 'du dossier'}`}
              className="w-full text-xs bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-accent/40"
              autoFocus
            />
            <div className="flex gap-1">
              <button
                type="submit"
                disabled={createNote.isPending || createFolder.isPending}
                className="text-xs bg-accent hover:bg-accent/80 text-black px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(null);
                  setNewItemName('');
                }}
                className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-2 py-1 rounded transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>

      {/* File tree */}
      <div className="p-2 overflow-auto h-full">
        {hasContent ? (
          <div className="space-y-1">
            {/* Show top-level folders first */}
            {topLevelFolders?.map((folderWithContent) => (
              <FolderItem
                key={`folder-${folderWithContent.id}`}
                folderWithContent={folderWithContent}
                isExpanded={expandedFolders.has(folderWithContent.id)}
                onToggle={() => toggleFolder(folderWithContent.id)}
                onDelete={() => handleDeleteFolder(folderWithContent)}
                onNoteSelect={onNoteSelect}
                selectedNoteId={selectedNoteId}
                onCreateNote={(parentId) => setShowCreateForm({ type: 'note', parentId })}
                onCreateFolder={(parentId) => setShowCreateForm({ type: 'folder', parentId })}
                onDeleteNote={handleDeleteNote}
                onDeleteFolder={handleDeleteFolder}
                level={0}
              />
            ))}
            
            {/* Show top-level notes */}
            {topLevelNotes?.map((note) => (
              <NoteItem
                key={`note-${note.id}`}
                note={note}
                isSelected={selectedNoteId === note.id}
                onSelect={() => onNoteSelect(note)}
                onDelete={() => handleDeleteNote(note)}
                level={0}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 text-sm mt-8 px-4">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <svg className="w-12 h-12 mx-auto mb-4 text-accent opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-white font-medium mb-2">Commencez votre recherche</h3>
              <p className="text-slate-400 text-xs mb-4">
                Ce réseau est vide. Créez votre première note ou dossier pour organiser vos idées.
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowCreateForm({ type: 'note' })}
                  className="text-xs bg-accent hover:bg-accent/80 text-black px-3 py-1 rounded transition-colors"
                >
                  + Note
                </button>
                <button
                  onClick={() => setShowCreateForm({ type: 'folder' })}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors"
                >
                  + Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={hideConfirm}
      />
    </div>
  );
}

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  level: number;
}

function NoteItem({ note, isSelected, onSelect, onDelete, level }: NoteItemProps) {
  return (
    <div className="group">
      <div
        className={`flex items-center gap-2 px-2 py-1 rounded text-sm cursor-pointer transition-colors ${
          isSelected 
            ? 'bg-accent/20 text-accent border border-accent/30' 
            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`}
        style={{ paddingLeft: `${8 + level * 16}px` }}
        onClick={onSelect}
      >
        {/* Note icon */}
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>

        {/* Note title */}
        <span className="flex-1 truncate">{note.title}</span>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 transition-all p-1"
          title="Supprimer la note"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface FolderItemProps {
  folderWithContent: FolderWithContent;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: number;
  onCreateNote: (parentId: number) => void;
  onCreateFolder: (parentId: number) => void;
  onDeleteNote: (note: Note) => void;
  onDeleteFolder: (folder: Folder | FolderWithContent) => void;
  level: number;
}

function FolderItem({ 
  folderWithContent, 
  isExpanded, 
  onToggle, 
  onDelete, 
  onNoteSelect, 
  selectedNoteId, 
  onCreateNote,
  onCreateFolder,
  onDeleteNote,
  onDeleteFolder,
  level 
}: FolderItemProps) {
  const totalItems = folderWithContent.notes.length + folderWithContent.subFolders.length;

  return (
    <div>
      {/* Folder header */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors hover:bg-slate-700 hover:text-white text-slate-300 group"
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={onToggle}
          className={`w-4 h-4 flex items-center justify-center rounded ${totalItems > 0 ? 'hover:bg-slate-600' : ''}`}
          disabled={totalItems === 0}
        >
          {totalItems > 0 ? (
            <svg 
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div className="w-3 h-3"></div>
          )}
        </button>

        {/* Folder icon */}
        <svg className="w-4 h-4 flex-shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>

        {/* Folder name */}
        <span 
          className="flex-1 truncate cursor-pointer select-none"
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (totalItems > 0) {
              onToggle();
            }
          }}
          title={totalItems > 0 ? "Double-cliquez pour ouvrir le dossier" : "Dossier vide"}
        >
          {folderWithContent.name}
        </span>

        {/* Item count */}
        <span className="text-xs text-slate-500">({totalItems})</span>

        {/* Action buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNote(folderWithContent.id);
            }}
            className="text-slate-400 hover:text-accent transition-all p-1"
            title="Créer une note dans ce dossier"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder(folderWithContent.id);
            }}
            className="text-slate-400 hover:text-yellow-400 transition-all p-1"
            title="Créer un sous-dossier"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-slate-400 hover:text-red-400 transition-all p-1"
            title="Supprimer le dossier"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Folder contents */}
      {isExpanded && (
        <div className="ml-4">
          {/* Sub-folders */}
          {folderWithContent.subFolders.map((subFolder) => (
            <SubFolderItem
              key={`subfolder-${subFolder.id}`}
              folder={subFolder}
              onNoteSelect={onNoteSelect}
              selectedNoteId={selectedNoteId}
              onCreateNote={onCreateNote}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={() => onDeleteFolder(subFolder)}
              onDeleteNote={onDeleteNote}
              level={level + 1}
            />
          ))}
          
          {/* Notes in this folder */}
          {folderWithContent.notes.map((note) => (
            <NoteItem
              key={`note-${note.id}`}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onNoteSelect(note)}
              onDelete={() => onDeleteNote(note)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SubFolderItemProps {
  folder: Folder;
  onNoteSelect: (note: Note) => void;
  selectedNoteId?: number;
  onCreateNote: (parentId: number) => void;
  onCreateFolder: (parentId: number) => void;
  onDeleteFolder: () => void;
  onDeleteNote: (note: Note) => void;
  level: number;
}

function SubFolderItem({ 
  folder, 
  onNoteSelect, 
  selectedNoteId, 
  onCreateNote,
  onCreateFolder,
  onDeleteFolder,
  onDeleteNote,
  level 
}: SubFolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: folderContent, isLoading } = useFolderContent(folder.id);

  const totalItems = folderContent ? (folderContent.notes.length + folderContent.subFolders.length) : 0;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* Sub-folder header */}
      <div
        className="flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors hover:bg-slate-700 hover:text-white text-slate-300 group"
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        {/* Expand/collapse button */}
        <button
          onClick={toggleExpanded}
          className={`w-4 h-4 flex items-center justify-center rounded ${!isLoading && totalItems > 0 ? 'hover:bg-slate-600' : ''}`}
          disabled={isLoading || totalItems === 0}
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-slate-500 border-t-transparent rounded-full animate-spin"></div>
          ) : totalItems > 0 ? (
            <svg 
              className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          ) : (
            <div className="w-3 h-3"></div>
          )}
        </button>

        {/* Folder icon */}
        <svg className="w-4 h-4 flex-shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
        </svg>

        {/* Folder name */}
        <span 
          className="flex-1 truncate cursor-pointer select-none"
          onDoubleClick={(e) => {
            e.stopPropagation();
            if (!isLoading && totalItems > 0) {
              setIsExpanded(!isExpanded);
            }
          }}
          title={isLoading ? "Chargement..." : totalItems > 0 ? "Double-cliquez pour ouvrir le dossier" : "Dossier vide"}
        >
          {folder.name}
        </span>

        {/* Item count */}
        {!isLoading && (
          <span className="text-xs text-slate-500">({totalItems})</span>
        )}

        {/* Action buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateNote(folder.id);
            }}
            className="text-slate-400 hover:text-accent transition-all p-1"
            title="Créer une note dans ce dossier"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder(folder.id);
            }}
            className="text-slate-400 hover:text-yellow-400 transition-all p-1"
            title="Créer un sous-dossier"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder();
            }}
            className="text-slate-400 hover:text-red-400 transition-all p-1"
            title="Supprimer le dossier"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub-folder contents */}
      {isExpanded && folderContent && (
        <div className="ml-4">
          {/* Nested sub-folders */}
          {folderContent.subFolders.map((nestedFolder) => (
            <SubFolderItem
              key={`nested-${nestedFolder.id}`}
              folder={nestedFolder}
              onNoteSelect={onNoteSelect}
              selectedNoteId={selectedNoteId}
              onCreateNote={onCreateNote}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={() => onDeleteFolder(nestedFolder)}
              onDeleteNote={onDeleteNote}
              level={level + 1}
            />
          ))}
          
          {/* Notes in this sub-folder */}
          {folderContent.notes.map((note) => (
            <NoteItem
              key={`note-${note.id}`}
              note={note}
              isSelected={selectedNoteId === note.id}
              onSelect={() => onNoteSelect(note)}
              onDelete={() => onDeleteNote(note)}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}