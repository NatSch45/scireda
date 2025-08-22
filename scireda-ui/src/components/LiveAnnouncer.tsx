interface LiveAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive';
  className?: string;
}

/**
 * Component for announcing messages to screen readers
 * Uses aria-live regions for accessibility
 */
export function LiveAnnouncer({ 
  message, 
  priority = 'polite',
  className = 'sr-only' 
}: LiveAnnouncerProps) {
  if (!message) return null;
  
  return (
    <div
      aria-live={priority}
      aria-atomic="true"
      className={className}
    >
      {message}
    </div>
  );
}

