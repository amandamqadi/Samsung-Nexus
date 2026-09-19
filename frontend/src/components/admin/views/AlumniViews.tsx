import { useMemo, useState } from 'react';
import {
  Award, Briefcase, Download, ExternalLink, FileText, Flag, FolderGit2, IdCard, ShieldCheck,
  Search, LogIn, LogOut, UserPlus, History,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';
import type { ActivityEventType, DocumentType } from '../../../types';

export default function AlumniViews({ view }: { view: AdminView }) {
  if (view === 'alumni.verification') return <VerificationView />;
  if (view === 'alumni.cohorts') return <CohortsView />;
  if (view === 'alumni.submissions') return <SubmissionsView />;
  if (view === 'alumni.login-activity') return <LoginActivityView />;
  return <AllAlumniView title={view === 'alumni.profiles' ? 'Alumni Profiles' : 'All Alumni'} />;
}

const DOC_ICON: Record<DocumentType, typeof IdCard> = {
  'ID Document': IdCard,
  'CV / Resume': Briefcase,
  Certificate: Award,
  Other: FileText,
};

function SubmissionsView() {
  const { allDocuments, allProjects } = useApp();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Submissions</h1>
      <p className="text-sm text-muted mb-6">Documents and projects alumni have uploaded to their profiles, for verification and recruiter visibility</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-hairline bg-card p-6">
          <h2 className="font-display font-semibold mb-4">Documents ({allDocuments.length})</h2>
          <div className="space-y-2">
            {allDocuments.length === 0 && <p className="text-xs text-faint">No documents submitted yet.</p>}
            {allDocuments.map((d) => {
              const Icon = DOC_ICON[d.docType];
              return (
                <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-card-alt px-3 py-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className="text-cyan-glow shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-primary truncate">{d.fileName}</p>
                      <p className="text-[11px] text-faint">
                        {d.ownerName} · {d.docType} · {d.sizeLabel} · {d.uploadedDate}
                        {!d.url && <span className="text-nexus-amber"> · upload pending</span>}
                      </p>
                    </div>
                  </div>
                  {d.url && (
                    <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-muted hover:text-cyan-glow hover:bg-card shrink-0" aria-label="View document">
                      <Download size={14} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-hairline bg-card p-6">
          <h2 className="font-display font-semibold mb-4">Projects ({allProjects.length})</h2>
          <div className="space-y-3">
            {allProjects.length === 0 && <p className="text-xs text-faint">No projects submitted yet.</p>}
            {allProjects.map((p) => (
              <div key={p.id} className="rounded-xl border border-hairline bg-card-alt p-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={15} className="text-nexus-violet shrink-0" />
                  <p className="text-sm font-semibold text-primary truncate">{p.title}</p>
                </div>
                <p className="text-[11px] text-faint mt-0.5">{p.ownerName} · Added {p.createdDate}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{p.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {p.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-hairline text-muted">{t}</span>)}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="text-[11px] text-samsung-blue hover:text-cyan-glow flex items-center gap-0.5 ml-auto">
                      View <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function AllAlumniView({ title }: { title: string }) {
  const { allUsers } = useApp();
  const [query, setQuery] = useState('');
  const alumni = useMemo(() => allUsers.filter((u) => u.role === 'user'), [allUsers]);
  const filtered = alumni.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">{title}</h1>
      <p className="text-sm text-muted mb-6">{alumni.length.toLocaleString()} registered alumni records</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alumni..."
          className="w-full rounded-lg bg-card border border-hairline pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        />
      </div>

      {filtered.length === 0 && <p className="text-sm text-faint">No alumni have created a profile yet.</p>}

      {filtered.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">Name</th>
                <th className="text-left font-medium px-5 py-3">Cohort</th>
                <th className="text-left font-medium px-5 py-3">Track</th>
                <th className="text-left font-medium px-5 py-3">Email</th>
                <th className="text-left font-medium px-5 py-3">Connections</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((a) => (
                <tr key={a.uid} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                  <td className="px-5 py-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-[10px] font-semibold">
                      {initials(a.name)}
                    </div>
                    <span className="font-medium text-primary">{a.name}</span>
                    {a.idVerified && <ShieldCheck size={12} className="text-nexus-emerald" />}
                  </td>
                  <td className="px-5 py-3 text-muted">{a.cohortYear}</td>
                  <td className="px-5 py-3 text-muted">{a.track}</td>
                  <td className="px-5 py-3 text-muted">{a.email}</td>
                  <td className="px-5 py-3 text-muted">{a.connectionsCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CohortsView() {
  const { allUsers } = useApp();
  const cohorts = useMemo(() => {
    const map = new Map<number, number>();
    allUsers.filter((u) => u.role === 'user').forEach((a) => map.set(a.cohortYear, (map.get(a.cohortYear) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [allUsers]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Cohorts</h1>
      <p className="text-sm text-muted mb-6">Alumni distribution across Samsung Innovation Campus cohorts</p>
      {cohorts.length === 0 && <p className="text-sm text-faint">No alumni have created a profile yet.</p>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cohorts.map(([year, count]) => (
          <div key={year} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="font-display text-2xl font-bold text-cyan-glow">{year}</div>
            <div className="text-xs text-muted mt-1">{count} alumni</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VerificationView() {
  const { verificationQueue, setVerificationStatus } = useApp();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Verification Queue</h1>
      <p className="text-sm text-muted mb-6">Review and approve new alumni applicants before they join the network</p>

      <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Applicant</th>
              <th className="text-left font-medium px-5 py-3">Track</th>
              <th className="text-left font-medium px-5 py-3">Submitted</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
              <th className="text-right font-medium px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {verificationQueue.map((v) => (
              <tr key={v.id} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                <td className="px-5 py-3 font-medium text-primary">{v.name} <span className="text-faint font-normal">· Class of {v.cohortYear}</span></td>
                <td className="px-5 py-3 text-muted">{v.track}</td>
                <td className="px-5 py-3 text-muted">{v.submittedDate}</td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    v.status === 'Verified' ? 'bg-nexus-emerald/15 text-nexus-emerald'
                    : v.status === 'Flagged' ? 'bg-red-500/15 text-red-400'
                    : 'bg-nexus-amber/15 text-nexus-amber'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => setVerificationStatus(v.id, 'Verified')}
                      disabled={v.status === 'Verified'}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-nexus-emerald/15 text-nexus-emerald font-medium disabled:opacity-40"
                    >
                      <ShieldCheck size={12} /> Approve
                    </button>
                    <button
                      onClick={() => setVerificationStatus(v.id, 'Flagged')}
                      disabled={v.status === 'Flagged'}
                      className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-red-500/15 text-red-400 font-medium disabled:opacity-40"
                    >
                      <Flag size={12} /> Flag
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const EVENT_META: Record<ActivityEventType, { label: string; icon: typeof LogIn; className: string }> = {
  login: { label: 'Login', icon: LogIn, className: 'bg-nexus-emerald/15 text-nexus-emerald' },
  signup: { label: 'Signup', icon: UserPlus, className: 'bg-samsung-blue/15 text-samsung-blue' },
  logout: { label: 'Logout', icon: LogOut, className: 'bg-nexus-amber/15 text-nexus-amber' },
};

function LoginActivityView() {
  const { activityLog } = useApp();
  const [query, setQuery] = useState('');
  const [eventFilter, setEventFilter] = useState<'All' | ActivityEventType>('All');

  const filtered = activityLog.filter((entry) => {
    const matchesQuery = entry.name.toLowerCase().includes(query.toLowerCase()) || entry.email.toLowerCase().includes(query.toLowerCase());
    const matchesEvent = eventFilter === 'All' || entry.event === eventFilter;
    return matchesQuery && matchesEvent;
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Login Activity</h1>
      <p className="text-sm text-muted mb-6">
        A live record of when each alumnus or admin signed up, logged in, and logged out — most recent {activityLog.length} events
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg bg-card border border-hairline pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value as 'All' | ActivityEventType)}
          className="rounded-lg bg-card border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        >
          <option value="All">All events</option>
          <option value="login">Login</option>
          <option value="signup">Signup</option>
          <option value="logout">Logout</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <History size={22} className="text-faint mx-auto mb-3" />
          <p className="text-sm text-muted">
            {activityLog.length === 0 ? 'No login activity recorded yet — events appear here as alumni sign up, sign in, and sign out.' : 'No events match your filters.'}
          </p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
                <th className="text-left font-medium px-5 py-3">User</th>
                <th className="text-left font-medium px-5 py-3">Role</th>
                <th className="text-left font-medium px-5 py-3">Event</th>
                <th className="text-left font-medium px-5 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((entry) => {
                const meta = EVENT_META[entry.event];
                const Icon = meta.icon;
                return (
                  <tr key={entry.id} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                    <td className="px-5 py-3">
                      <p className="font-medium text-primary">{entry.name}</p>
                      <p className="text-xs text-faint">{entry.email}</p>
                    </td>
                    <td className="px-5 py-3 text-muted capitalize">{entry.role}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium ${meta.className}`}>
                        <Icon size={12} /> {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {entry.createdAt ? entry.createdAt.toDate().toLocaleString() : 'just now'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
