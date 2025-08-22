import { useEffect, useState } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'default'
}: ConfirmModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const confirmButtonClass = variant === 'danger' 
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-accent hover:bg-accent/80 text-black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div 
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="relative bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onCancel}
            aria-label="Fermer la modale"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p id="modal-description" className="text-slate-300 whitespace-pre-line leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm?: () => void;
}

export function useConfirmModal() {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showConfirm = (config: Omit<ConfirmState, 'isOpen'> & { onConfirm: () => void }) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        ...config,
        isOpen: true,
        onConfirm: () => {
          config.onConfirm();
          setConfirmState(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
      });
    });
  };

  const hideConfirm = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const ConfirmModalComponent = () => (
    <ConfirmModal
      {...confirmState}
      onConfirm={confirmState.onConfirm || (() => {})}
      onCancel={hideConfirm}
    />
  );

  return {
    showConfirm,
    hideConfirm,
    ConfirmModal: ConfirmModalComponent,
  };
}
