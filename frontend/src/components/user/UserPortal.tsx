import { useState } from 'react';
import { Bell, ChevronDown, FolderGit2, HelpCircle, LogOut, Settings, Sparkles, User as UserIcon, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import HomeTab from './tabs/HomeTab';
import CommunityTab from './tabs/CommunityTab';
import OpportunitiesTab from './tabs/OpportunitiesTab';
import EventsTab from './tabs/EventsTab';
import BattlesTab from './tabs/BattlesTab';
import MessagesTab from './tabs/MessagesTab';
import ProfileModal from './ProfileModal';
import ProjectsModal from './ProjectsModal';

const TABS = ['Home', 'Nexus Battles', 'Community', 'Opportunities', 'Events', 'Messages'] as const;
type Tab = (typeof TABS)[number];

export default function UserPortal() {
  const { currentUser, logout, setSettingsModalOpen, notifications } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface text-primary">
      <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-samsung-blue flex items-center justify-center font-display font-bold text-white text-xs">S</div>
            <div className="font-display font-bold text-sm hidden sm:block">
              SAMSUNG <span className="text-cyan-glow">NEXUS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-card-alt rounded-full p-1 border border-hairline">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab ? 'bg-samsung-blue text-white' : 'text-muted hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-full hover:bg-card-alt text-muted hover:text-primary transition-colors"
              >
                <Bell size={18} />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-nexus-amber" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-hairline bg-card shadow-xl p-3 animate-fade-in text-sm max-h-80 overflow-y-auto">
                  <p className="font-semibold text-primary mb-2">Notifications</p>
                  <div className="space-y-2.5 text-xs">
                    {notifications.length === 0 && <p className="text-faint">No notifications yet.</p>}
                    {notifications.map((n) => (
                      <div key={n.id} className="border-b border-hairline last:border-0 pb-2 last:pb-0">
                        <p className="text-muted">{n.message}</p>
                        <p className="text-[10px] text-faint mt-0.5">{n.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full hover:bg-card-alt transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center text-white text-xs font-semibold">
                  {currentUser?.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <ChevronDown size={14} className="text-muted hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-hairline bg-card shadow-xl overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-hairline flex items-center gap-3">
                    <UserIcon size={16} className="text-cyan-glow" />
                    <div>
                      <p className="text-sm font-semibold text-primary">{currentUser?.name}</p>
                      <p className="text-xs text-muted">Alumni Member • Class of {currentUser?.cohortYear} ({currentUser?.track})</p>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setProfileModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left"
                    >
                      <UserIcon size={15} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        setProjectsModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left"
                    >
                      <FolderGit2 size={15} /> My Projects
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left">
                      <Users size={15} /> My Connections
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left">
                      <Sparkles size={15} /> Saved Opportunities
                    </button>
                    <button
                      onClick={() => {
                        setSettingsModalOpen(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left"
                    >
                      <Settings size={15} /> Settings
                    </button>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left">
                      <HelpCircle size={15} /> Help & Support
                    </button>
                  </div>
                  <div className="border-t border-hairline py-1">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-card-alt text-left"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden flex overflow-x-auto gap-1 px-4 pb-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-samsung-blue text-white' : 'bg-card-alt text-muted'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'Home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'Nexus Battles' && <BattlesTab />}
        {activeTab === 'Community' && <CommunityTab />}
        {activeTab === 'Opportunities' && <OpportunitiesTab />}
        {activeTab === 'Events' && <EventsTab />}
        {activeTab === 'Messages' && <MessagesTab />}
      </main>

      <ProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenProjects={() => {
          setProfileModalOpen(false);
          setProjectsModalOpen(true);
        }}
      />
      <ProjectsModal open={projectsModalOpen} onClose={() => setProjectsModalOpen(false)} />
    </div>
  );
}
