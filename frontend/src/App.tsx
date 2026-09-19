import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './components/landing/LandingPage';
import LoginModal from './components/auth/LoginModal';
import LegalModal from './components/legal/LegalModal';
import SettingsModal from './components/settings/SettingsModal';
import NexusAssistant from './components/assistant/NexusAssistant';
import UserPortal from './components/user/UserPortal';
import AdminPortal from './components/admin/AdminPortal';

function Shell() {
  const { role, toast, authChecked } = useApp();

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-hairline-strong border-t-cyan-glow animate-spin" />
      </div>
    );
  }

  return (
    <>
      {role === 'visitor' && <LandingPage />}
      {role === 'user' && <UserPortal />}
      {role === 'admin' && <AdminPortal />}

      <LoginModal />
      <LegalModal />
      <SettingsModal />
      {role !== 'visitor' && <NexusAssistant />}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-full bg-card border border-hairline-strong text-primary text-sm shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
