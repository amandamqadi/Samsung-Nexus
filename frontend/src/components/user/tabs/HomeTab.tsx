import { Briefcase, Calendar, Send, Users } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function HomeTab({ onNavigate }: { onNavigate: (tab: 'Community' | 'Opportunities' | 'Events' | 'Messages' | 'Home') => void }) {
  const { currentUser, profile, myApplications, allUsers, announcements, connectWithAlumnus } = useApp();

  const stats = [
    { icon: Users, label: 'Connections', value: currentUser?.connectionsCount ?? 0, color: 'text-cyan-glow' },
    { icon: Briefcase, label: 'Saved Opportunities', value: profile.savedOpportunityIds.length, color: 'text-nexus-emerald' },
    { icon: Calendar, label: 'Upcoming RSVPs', value: profile.rsvpedEventIds.length, color: 'text-nexus-violet' },
    { icon: Send, label: 'Applications Sent', value: myApplications.length, color: 'text-nexus-amber' },
  ];

  const recommended = allUsers.filter((u) => u.role === 'user' && u.uid !== currentUser?.uid).slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-hairline bg-gradient-to-br from-card to-samsung-blue/10 p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">Welcome back, {currentUser?.name.split(' ')[0]} 👋</h1>
        <p className="text-sm text-muted mt-1">
          Class of {currentUser?.cohortYear} · {currentUser?.track} — here's what's happening in your Samsung Nexus network.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-hairline bg-card p-4">
            <Icon size={18} className={color} />
            <div className="font-display text-xl font-bold mt-2">{value}</div>
            <div className="text-xs text-muted mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-hairline bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recent Announcements</h2>
          </div>
          <div className="space-y-4">
            {announcements.length === 0 && <p className="text-xs text-faint">No announcements yet.</p>}
            {announcements.map((a) => (
              <div key={a.id} className="border-b border-hairline last:border-0 pb-4 last:pb-0">
                <p className="text-sm font-semibold text-primary">{a.title}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{a.body}</p>
                <p className="text-[11px] text-faint mt-1.5">{a.date} · {a.author}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Recommended Alumni</h2>
            <button onClick={() => onNavigate('Community')} className="text-xs text-samsung-blue hover:text-cyan-glow">See all</button>
          </div>
          <div className="space-y-3">
            {recommended.length === 0 && <p className="text-xs text-faint">No other alumni have signed up yet.</p>}
            {recommended.map((a) => {
              const connected = profile.connectedUids.includes(a.uid);
              return (
                <div key={a.uid} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
                      {initials(a.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary truncate">{a.name}</p>
                      <p className="text-[11px] text-faint truncate">{a.track}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connectWithAlumnus(a.uid)}
                    disabled={connected}
                    className={`text-[11px] px-2.5 py-1 rounded-full border shrink-0 ${
                      connected ? 'border-hairline text-nexus-emerald' : 'border-hairline-strong text-muted hover:text-primary hover:border-cyan-glow'
                    }`}
                  >
                    {connected ? 'Connected' : `${a.connectionsCount ?? 0} · Connect`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
