import { ChatWidget } from './ChatWidget';

/** Public floating chat control, bottom-right. */
export function FloatingDock() {
  return (
    <div className="dock" aria-label="GoDrive chat">
      <ChatWidget />
    </div>
  );
}
