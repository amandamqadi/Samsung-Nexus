import { Briefcase, Layers, Send, Users } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';

export default function DashboardView({ onNavigate }: { onNavigate: (v: AdminView) => void }) {
  const { verificationQueue, opportunities, events, applications, allUsers, setVerificationStatus } = useApp();
  const pending = verificationQueue.filter((v) => v.status === 'Pending');
  const alumni = allUsers.filter((u) => u.role === 'user');
  const cohortCount = new Set(alumni.map((a) => a.cohortYear)).size;

  const kpis = [
    { icon: Users, label: 'Registered Alumni', value: alumni.length.toLocaleString(), color: 'text-cyan-glow' },
    { icon: Layers, label: 'Active Cohorts', value: cohortCount, color: 'text-nexus-violet' },
    { icon: Briefcase, label: 'Live Opportunities', value: opportunities.length, color: 'text-nexus-emerald' },
    { icon: Send, label: 'Applications Received', value: applications.length, color: 'text-nexus-amber' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Real-time overview of the Samsung Nexus alumni network</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border border-hairline bg-card p-5">
            <Icon size={20} className={color} />
            <div className="font-display text-2xl font-bold mt-3">{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-hairline bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Verification Queue</h2>
            <button onClick={() => onNavigate('alumni.verification')} className="text-xs text-samsung-blue hover:text-cyan-glow">View all</button>
          </div>
          <div className="space-y-3">
            {pending.slice(0, 4).map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{v.name}</p>
                  <p className="text-[11px] text-faint">{v.track} · Class of {v.cohortYear}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => setVerificationStatus(v.id, 'Verified')} className="text-[11px] px-2.5 py-1 rounded-full bg-nexus-emerald/15 text-nexus-emerald font-medium">Approve</button>
                  <button onClick={() => setVerificationStatus(v.id, 'Flagged')} className="text-[11px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 font-medium">Flag</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <p className="text-xs text-faint">No pending applicants — queue is clear.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold">Upcoming Events</h2>
            <button onClick={() => onNavigate('events.all')} className="text-xs text-samsung-blue hover:text-cyan-glow">View all</button>
          </div>
          <div className="space-y-3">
            {events.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary truncate">{e.title}</p>
                  <p className="text-[11px] text-faint">{e.date} · {e.format}</p>
                </div>
                <span className="text-[11px] text-muted shrink-0">{e.attendeesCount} attending</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
