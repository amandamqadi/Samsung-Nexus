import { useState } from 'react';
import {
  BarChart3, Bell, Briefcase, Calendar, ChevronDown, ChevronRight, FileText, Home,
  LayoutDashboard, LogOut, Megaphone, Settings as SettingsIcon, Shield, Swords, Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import DashboardView from './views/DashboardView';
import AlumniViews from './views/AlumniViews';
import EngagementViews from './views/EngagementViews';
import OpportunitiesAdmin from './views/OpportunitiesAdmin';
import EventsAdmin from './views/EventsAdmin';
import ContentAdmin from './views/ContentAdmin';
import ReportsAdmin from './views/ReportsAdmin';
import BattlesAdmin from './views/BattlesAdmin';

export type AdminView =
  | 'dashboard'
  | 'alumni.all' | 'alumni.cohorts' | 'alumni.profiles' | 'alumni.verification' | 'alumni.submissions'
  | 'engagement.activity' | 'engagement.connections' | 'engagement.analytics'
  | 'opportunities.all' | 'opportunities.add' | 'opportunities.applications'
  | 'events.all' | 'events.create' | 'events.attendance'
  | 'content.announcements' | 'content.resources'
  | 'battles.categories'
  | 'reports.outcomes' | 'reports.engagement' | 'reports.export';

interface Group {
  key: string;
  label: string;
  icon: typeof Users;
  children: { key: AdminView; label: string }[];
}

const GROUPS: Group[] = [
  { key: 'alumni', label: 'Alumni', icon: Users, children: [
    { key: 'alumni.all', label: 'All Alumni' },
    { key: 'alumni.cohorts', label: 'Cohorts' },
    { key: 'alumni.profiles', label: 'Profiles' },
    { key: 'alumni.verification', label: 'Verification' },
    { key: 'alumni.submissions', label: 'Submissions' },
  ] },
  { key: 'engagement', label: 'Engagement', icon: BarChart3, children: [
    { key: 'engagement.activity', label: 'Activity' },
    { key: 'engagement.connections', label: 'Connections' },
    { key: 'engagement.analytics', label: 'Platform Analytics' },
  ] },
  { key: 'opportunities', label: 'Opportunities', icon: Briefcase, children: [
    { key: 'opportunities.all', label: 'All Opportunities' },
    { key: 'opportunities.add', label: 'Add Opportunity' },
    { key: 'opportunities.applications', label: 'Applications' },
  ] },
  { key: 'events', label: 'Events', icon: Calendar, children: [
    { key: 'events.all', label: 'All Events' },
    { key: 'events.create', label: 'Create Event' },
    { key: 'events.attendance', label: 'Attendance' },
  ] },
  { key: 'content', label: 'Content', icon: Megaphone, children: [
    { key: 'content.announcements', label: 'Announcements' },
    { key: 'content.resources', label: 'Resources' },
  ] },
  { key: 'battles', label: 'Nexus Battles', icon: Swords, children: [
    { key: 'battles.categories', label: 'Categories' },
  ] },
  { key: 'reports', label: 'Reports', icon: FileText, children: [
    { key: 'reports.outcomes', label: 'Alumni Outcomes' },
    { key: 'reports.engagement', label: 'Engagement Reports' },
    { key: 'reports.export', label: 'Export Data' },
  ] },
];

export default function AdminPortal() {
  const { currentUser, logout, setSettingsModalOpen, verificationQueue, allDocuments, allProjects } = useApp();
  const [view, setView] = useState<AdminView>('dashboard');
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['alumni']));
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  const pendingCount = verificationQueue.filter((v) => v.status === 'Pending').length;
  const submissionsCount = allDocuments.length + allProjects.length;

  const sidebar = (
    <div className="flex flex-col h-full bg-card border-r border-hairline w-72 shrink-0">
      <div className="p-5 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-samsung-blue flex items-center justify-center font-display font-bold text-white text-xs">S</div>
          <div>
            <div className="font-display font-bold text-xs leading-tight">SAMSUNG ALUMNI</div>
            <div className="text-[10px] text-cyan-glow tracking-widest">ADMIN PORTAL</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => setView('dashboard')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            view === 'dashboard' ? 'bg-samsung-blue text-white' : 'text-muted hover:bg-card-alt hover:text-primary'
          }`}
        >
          <LayoutDashboard size={16} /> Dashboard
        </button>

        {GROUPS.map((g) => {
          const isOpen = openGroups.has(g.key);
          const Icon = g.icon;
          return (
            <div key={g.key}>
              <button
                onClick={() => toggleGroup(g.key)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-card-alt hover:text-primary transition-colors"
              >
                <span className="flex items-center gap-2.5"><Icon size={16} /> {g.label}</span>
                <span className="flex items-center gap-1">
                  {g.key === 'alumni' && pendingCount > 0 && (
                    <span className="text-[10px] bg-nexus-amber text-black rounded-full w-4 h-4 flex items-center justify-center font-semibold">{pendingCount}</span>
                  )}
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>
              {isOpen && (
                <div className="ml-4 pl-4 border-l border-hairline space-y-0.5 py-1">
                  {g.children.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        setView(c.key);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        view === c.key ? 'bg-samsung-blue/15 text-cyan-glow' : 'text-faint hover:text-primary hover:bg-card-alt'
                      }`}
                    >
                      <span>{c.label}</span>
                      {c.key === 'alumni.verification' && pendingCount > 0 && (
                        <span className="text-[10px] bg-nexus-amber text-black rounded-full px-1.5 font-semibold">{pendingCount}</span>
                      )}
                      {c.key === 'alumni.submissions' && submissionsCount > 0 && (
                        <span className="text-[10px] bg-cyan-glow text-black rounded-full px-1.5 font-semibold">{submissionsCount}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="relative border-t border-hairline p-3">
        <button
          onClick={() => setUserMenuOpen((v) => !v)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-card-alt transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center text-white text-xs font-semibold shrink-0">
            <Shield size={14} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold text-primary truncate">{currentUser?.name}</p>
            <p className="text-[11px] text-faint">Administrator</p>
          </div>
        </button>
        {userMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-hairline bg-card shadow-xl overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-hairline">
              <p className="text-sm font-semibold text-primary">{currentUser?.name}</p>
              <p className="text-xs text-muted">Administrator</p>
            </div>
            <button
              onClick={() => {
                setSettingsModalOpen(true);
                setUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary text-left"
            >
              <SettingsIcon size={15} /> Settings
            </button>
            <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-card-alt text-left">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface text-primary flex">
      <div className="hidden lg:block">{sidebar}</div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-hairline bg-surface/90 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-card-alt text-muted">
            <Home size={18} />
          </button>
          <span className="font-display font-bold text-sm">ADMIN PORTAL</span>
          <Bell size={18} className="text-muted" />
        </header>

        <main className="p-4 sm:p-8 max-w-7xl mx-auto">
          {view === 'dashboard' && <DashboardView onNavigate={setView} />}
          {view.startsWith('alumni.') && <AlumniViews view={view} />}
          {view.startsWith('engagement.') && <EngagementViews view={view} />}
          {view.startsWith('opportunities.') && <OpportunitiesAdmin view={view} />}
          {view.startsWith('events.') && <EventsAdmin view={view} />}
          {view.startsWith('content.') && <ContentAdmin view={view} />}
          {view.startsWith('battles.') && <BattlesAdmin />}
          {view.startsWith('reports.') && <ReportsAdmin view={view} />}
        </main>
      </div>
    </div>
  );
}
