import { Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';

export default function ReportsAdmin({ view }: { view: AdminView }) {
  if (view === 'reports.export') return <ExportView />;
  if (view === 'reports.engagement') return <EngagementReportView />;
  return <OutcomesView />;
}

function OutcomesView() {
  const { allUsers } = useApp();
  const alumni = allUsers.filter((u) => u.role === 'user');
  const tracks: Record<string, number> = {};
  alumni.forEach((a) => {
    tracks[a.track] = (tracks[a.track] ?? 0) + 1;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Alumni Outcomes</h1>
      <p className="text-sm text-muted mb-6">Track distribution across registered alumni — captured automatically at sign-up</p>
      {alumni.length === 0 && <p className="text-sm text-faint">No alumni have created a profile yet.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(tracks).map(([track, count]) => (
          <div key={track} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="font-display text-2xl font-bold text-cyan-glow">{count}</div>
            <div className="text-xs text-muted mt-1">{track}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementReportView() {
  const { allUsers, opportunities, applications, events, feedPosts } = useApp();
  const alumni = allUsers.filter((u) => u.role === 'user');
  const activeAlumni = new Set(applications.map((a) => a.applicantId)).size;
  const activeRate = alumni.length > 0 ? Math.round((activeAlumni / alumni.length) * 100) : 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Engagement Reports</h1>
      <p className="text-sm text-muted mb-6">Real programme-level participation captured automatically as alumni use the platform</p>
      <div className="rounded-2xl border border-hairline bg-card p-6 space-y-3">
        {[
          ['Alumni Who Have Applied to an Opportunity', `${activeRate}% (${activeAlumni} of ${alumni.length})`],
          ['Live Opportunities Posted', opportunities.length.toString()],
          ['Events Scheduled', events.length.toString()],
          ['Projects Shared to the Feed', feedPosts.length.toString()],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm border-b border-hairline last:border-0 pb-3 last:pb-0">
            <span className="text-muted">{label}</span>
            <span className="font-semibold text-primary">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportView() {
  const { allUsers, opportunities, events, showToast } = useApp();
  const alumni = allUsers.filter((u) => u.role === 'user');

  function handleExport() {
    const payload = {
      exportedAt: new Date().toISOString(),
      alumniRegistry: alumni,
      opportunities,
      events,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `samsung-nexus-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Export generated and downloaded');
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Export Data</h1>
      <p className="text-sm text-muted mb-6">Generate a clean JSON export of the alumni registry, opportunities, and events telemetry</p>

      <div className="rounded-2xl border border-hairline bg-card p-8 text-center max-w-md">
        <Download size={28} className="text-cyan-glow mx-auto" />
        <p className="text-sm text-muted mt-3 mb-5">
          Includes {alumni.length} alumni records, {opportunities.length} opportunities, and {events.length} events.
        </p>
        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          Download JSON Export
        </button>
      </div>
    </div>
  );
}
