import { useMemo, useState } from 'react';
import { Rss, Search, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { TRACKS } from '../../../data/mockData';
import FeedTab from './FeedTab';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

type SubView = 'directory' | 'feed';

export default function CommunityTab() {
  const { allUsers, currentUser, connectWithAlumnus, profile } = useApp();
  const [subView, setSubView] = useState<SubView>('directory');
  const [query, setQuery] = useState('');
  const [cohort, setCohort] = useState('All');
  const [track, setTrack] = useState('All');

  const alumni = useMemo(
    () => allUsers.filter((u) => u.role === 'user' && u.uid !== currentUser?.uid),
    [allUsers, currentUser?.uid],
  );

  const cohortYears = useMemo(() => Array.from(new Set(alumni.map((a) => a.cohortYear))).sort(), [alumni]);

  const filtered = alumni.filter((a) => {
    const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase()) || a.email.toLowerCase().includes(query.toLowerCase());
    const matchesCohort = cohort === 'All' || a.cohortYear === Number(cohort);
    const matchesTrack = track === 'All' || a.track === track;
    return matchesQuery && matchesCohort && matchesTrack;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Alumni Community</h1>
          <p className="text-sm text-muted mt-1">
            {subView === 'directory' ? `${filtered.length} members match your filters` : 'Projects shared by alumni you can connect with'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-card-alt rounded-full p-1 border border-hairline shrink-0">
          <button
            onClick={() => setSubView('directory')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              subView === 'directory' ? 'bg-samsung-blue text-white' : 'text-muted hover:text-primary'
            }`}
          >
            <Users size={13} /> Directory
          </button>
          <button
            onClick={() => setSubView('feed')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              subView === 'feed' ? 'bg-samsung-blue text-white' : 'text-muted hover:text-primary'
            }`}
          >
            <Rss size={13} /> Feed
          </button>
        </div>
      </div>

      {subView === 'feed' ? (
        <FeedTab embedded />
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-3 mb-6">
            <div className="relative sm:col-span-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg bg-card border border-hairline pl-9 pr-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
              />
            </div>
            <select value={track} onChange={(e) => setTrack(e.target.value)} className="rounded-lg bg-card border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
              <option>All</option>
              {TRACKS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={cohort} onChange={(e) => setCohort(e.target.value)} className="rounded-lg bg-card border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
              <option>All</option>
              {cohortYears.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
              <p className="text-sm text-muted">
                {alumni.length === 0 ? 'No other alumni have created a profile yet — invite them to sign up!' : 'No alumni match your filters.'}
              </p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((a) => {
              const connected = profile.connectedUids.includes(a.uid);
              return (
                <div key={a.uid} className="rounded-2xl border border-hairline bg-card p-5 hover:border-hairline-strong transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-sm font-semibold shrink-0">
                      {initials(a.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-primary truncate">{a.name}</p>
                        {a.idVerified && <ShieldCheck size={13} className="text-nexus-emerald shrink-0" />}
                      </div>
                      <p className="text-xs text-muted truncate">{a.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
                    <span className="text-[11px] text-faint">Class of {a.cohortYear} · {a.track}</span>
                    <button
                      onClick={() => connectWithAlumnus(a.uid)}
                      disabled={connected}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                        connected ? 'bg-card-alt border border-hairline text-nexus-emerald' : 'bg-samsung-blue hover:bg-samsung-blue-dark text-white'
                      }`}
                    >
                      {connected ? 'Connected' : `Connect (${a.connectionsCount ?? 0})`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
