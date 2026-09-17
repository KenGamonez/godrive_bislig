import { ChatWidget } from './ChatWidget';
import { WeatherWidget } from './WeatherWidget';

/** Public floating stack, bottom-right: weather above chat. */
export function FloatingDock() {
  return (
    <div className="dock" aria-label="GoDrive quick tools">
      <WeatherWidget />
      <ChatWidget />
    </div>
  );
}
