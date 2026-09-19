import { Moon, Sun } from 'lucide-react';
import Modal, { ModalHeader } from '../common/Modal';
import { useApp } from '../../context/AppContext';

export default function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen, theme, setTheme, currentUser } = useApp();

  return (
    <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} maxWidth="max-w-md">
      <ModalHeader title="Settings" subtitle={currentUser ? `Signed in as ${currentUser.email}` : undefined} />

      <div>
        <h3 className="text-sm font-semibold text-primary mb-1">Theme (for background)</h3>
        <p className="text-xs text-muted mb-3">Choose how Samsung Nexus looks on this device.</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'dark' ? 'border-cyan-glow bg-black text-white' : 'border-hairline text-muted hover:border-hairline-strong'
            }`}
          >
            <Moon size={20} />
            <span className="text-xs font-medium">Dark Pitch Black</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'light' ? 'border-samsung-blue bg-white text-slate-900' : 'border-hairline text-muted hover:border-hairline-strong'
            }`}
          >
            <Sun size={20} />
            <span className="text-xs font-medium">White Background</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
