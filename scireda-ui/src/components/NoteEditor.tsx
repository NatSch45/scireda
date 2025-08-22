import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Note } from '../lib/api-types';

interface NoteEditorProps {
  note?: Note;
  onSave: (content: string) => void;
  onTitleChange: (title: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function NoteEditor({ 
  note, 
  onSave, 
  onTitleChange, 
  isLoading = false,
  className = '' 
}: NoteEditorProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');

  // Update content when note changes
  useEffect(() => {
    if (note) {
      setContent(note.content || '');
    }
  }, [note?.id, note?.content]);

  // Update title input when note changes
  useEffect(() => {
    if (titleRef.current && note) {
      titleRef.current.value = note.title || '';
    }
  }, [note?.id, note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onSave(newContent);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus the content editor after pressing Enter in title
      const contentEditor = document.getElementById('content-editor');
      if (contentEditor) {
        contentEditor.focus();
      }
    }
  };

  if (!note) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-slate-400">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">Aucune note sélectionnée</h3>
          <p className="text-slate-400">
            Sélectionnez une note dans l'explorateur ou créez-en une nouvelle.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header with Title and View Mode Controls */}
      <div className="border-b border-slate-700 p-4 bg-slate-800">
        <div className="flex items-center justify-between mb-3">
          <input
            ref={titleRef}
            type="text"
            defaultValue={note.title || ''}
            onChange={handleTitleChange}
            onKeyDown={handleTitleKeyDown}
            placeholder="Titre de la note"
            disabled={isLoading}
            className="flex-1 bg-transparent text-xl font-semibold text-white placeholder-slate-400 border-none outline-none focus:ring-0 disabled:opacity-50 mr-4"
          />
          
          {/* View Mode Toggle */}
          <div className="flex bg-slate-700 rounded-lg p-1" role="tablist" aria-label="Mode d'affichage">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'edit' 
                  ? 'bg-accent text-black' 
                  : 'text-slate-300 hover:text-white'
              }`}
              role="tab"
              aria-selected={viewMode === 'edit'}
              aria-controls="editor-content"
              aria-label="Mode édition"
              title="Mode édition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'split' 
                  ? 'bg-accent text-black' 
                  : 'text-slate-300 hover:text-white'
              }`}
              role="tab"
              aria-selected={viewMode === 'split'}
              aria-controls="editor-content"
              aria-label="Mode divisé (édition et prévisualisation)"
              title="Mode divisé"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === 'preview' 
                  ? 'bg-accent text-black' 
                  : 'text-slate-300 hover:text-white'
              }`}
              role="tab"
              aria-selected={viewMode === 'preview'}
              aria-controls="editor-content"
              aria-label="Mode prévisualisation"
              title="Mode prévisualisation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-xs text-slate-400">
          Créée le {new Date(note.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
          {note.updatedAt !== note.createdAt && (
            <span className="ml-4">
              Modifiée le {new Date(note.updatedAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Chargement de l'éditeur...</div>
          </div>
        ) : (
          <div className={`h-full flex ${viewMode === 'split' ? 'divide-x divide-slate-700' : ''}`}>
            {/* Editor Panel */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                <div className="bg-slate-700/30 px-4 py-2 text-xs font-medium text-slate-400 border-b border-slate-700">
                  MARKDOWN
                </div>
                <div className="flex-1 p-6">
                  <textarea
                    id="content-editor"
                    value={content}
                    onChange={handleContentChange}
                    placeholder="# Titre de votre note

Commencez à écrire votre note en **Markdown**...

## Fonctionnalités supportées

- **Gras** et *italique*
- [Liens](https://example.com)
- `Code inline`
- Listes à puces
- Et bien plus !

```javascript
// Blocs de code
console.log('Hello, Markdown!');
```"
                    disabled={isLoading}
                    className="w-full h-full bg-transparent text-slate-200 placeholder-slate-400 border-none outline-none resize-none font-mono text-sm leading-relaxed disabled:opacity-50"
                    style={{ 
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      tabSize: 2
                    }}
                  />
                </div>
              </div>
            )}

            {/* Preview Panel */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} flex flex-col`}>
                <div className="bg-slate-700/30 px-4 py-2 text-xs font-medium text-slate-400 border-b border-slate-700">
                  PRÉVISUALISATION
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="prose prose-invert prose-slate max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-semibold text-white mb-3 mt-5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-white mb-3 mt-4">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h4>,
                        h5: ({ children }) => <h5 className="text-base font-semibold text-white mb-2 mt-3">{children}</h5>,
                        h6: ({ children }) => <h6 className="text-sm font-semibold text-white mb-2 mt-3">{children}</h6>,
                        p: ({ children }) => <p className="text-slate-200 mb-4 leading-relaxed">{children}</p>,
                        a: ({ children, href }) => <a href={href} className="text-accent hover:text-accent/80 underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                        code: ({ children, className }) => {
                          const isInline = !className;
                          return isInline 
                            ? <code className="bg-slate-700 text-accent px-2 py-1 rounded text-sm font-mono">{children}</code>
                            : <code className={className}>{children}</code>;
                        },
                        pre: ({ children }) => <pre className="bg-slate-700 border border-slate-600 rounded-lg p-4 mb-4 overflow-x-auto text-slate-200">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-accent/50 bg-slate-700/50 pl-4 py-2 mb-4 italic text-slate-300">{children}</blockquote>,
                        ul: ({ children }) => <ul className="text-slate-200 mb-4 ml-6 list-disc">{children}</ul>,
                        ol: ({ children }) => <ol className="text-slate-200 mb-4 ml-6 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
                        hr: () => <hr className="border-0 border-t border-slate-600 my-6" />,
                        table: ({ children }) => <table className="w-full mb-4 border-collapse">{children}</table>,
                        th: ({ children }) => <th className="border border-slate-600 px-3 py-2 text-left bg-slate-700 font-semibold text-white">{children}</th>,
                        td: ({ children }) => <td className="border border-slate-600 px-3 py-2 text-slate-200">{children}</td>,
                      }}
                    >
                      {content || '*Aucun contenu à prévisualiser*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-slate-700 px-4 py-2 bg-slate-800 text-xs text-slate-400">
        <div className="flex justify-between items-center">
          <div>
            Réseau: {note.networkId} | ID: {note.id}
            {note.parentId && ` | Dossier: ${note.parentId}`}
          </div>
          <div className="flex items-center gap-2">
            <span>Markdown</span>
            <div className="w-2 h-2 bg-green-400 rounded-full" title="Sauvegarde automatique activée"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
