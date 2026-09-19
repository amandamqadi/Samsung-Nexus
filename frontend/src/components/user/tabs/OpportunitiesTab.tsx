import { useState } from 'react';
import { Bookmark, BookmarkCheck, Briefcase, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { OpportunityType } from '../../../types';

const FILTERS: ('All' | OpportunityType)[] = ['All', 'Full-time', 'Internship', 'Fellowship'];

export default function OpportunitiesTab() {
  const { opportunities, profile, myApplications, toggleSaveOpportunity, applyToOpportunity } = useApp();
  const [filter, setFilter] = useState<'All' | OpportunityType>('All');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  async function handleApply(id: string) {
    setApplyingId(id);
    try {
      await applyToOpportunity(id);
    } finally {
      setApplyingId(null);
    }
  }

  const filtered = filter === 'All' ? opportunities : opportunities.filter((o) => o.type === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Opportunities</h1>
          <p className="text-sm text-muted mt-1">Jobs, internships, and fellowships from Samsung and partner employers</p>
        </div>
        <div className="flex gap-1.5 bg-card-alt border border-hairline rounded-full p-1 self-start">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f ? 'bg-samsung-blue text-white' : 'text-muted hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <p className="text-sm text-muted">No opportunities posted yet — check back soon.</p>
        </div>
      )}

      <div className="space-y-4">
        {filtered.map((o) => {
          const saved = profile.savedOpportunityIds.includes(o.id);
          const applied = myApplications.some((a) => a.opportunityId === o.id);
          return (
          <div key={o.id} className="rounded-2xl border border-hairline bg-card p-5 hover:border-hairline-strong transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-card-alt border border-hairline flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-samsung-blue" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-primary">{o.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{o.type}</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{o.company}</p>
                  <p className="text-[11px] text-faint flex items-center gap-1 mt-1"><MapPin size={11} /> {o.location} · {o.salaryRange}</p>
                  <p className="text-xs text-muted mt-2 leading-relaxed">{o.description}</p>
                  <p className="text-[11px] text-faint mt-2">{o.applicantsCount} applicants · Posted {o.postedDate} by {o.postedBy}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => toggleSaveOpportunity(o.id)}
                  className="p-2 rounded-lg text-muted hover:text-cyan-glow hover:bg-card-alt transition-colors"
                  aria-label="Save"
                >
                  {saved ? <BookmarkCheck size={18} className="text-cyan-glow" /> : <Bookmark size={18} />}
                </button>
                <button
                  onClick={() => handleApply(o.id)}
                  disabled={applied || applyingId === o.id}
                  className={`flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors whitespace-nowrap ${
                    applied
                      ? 'bg-nexus-emerald/15 text-nexus-emerald cursor-default'
                      : 'bg-samsung-blue hover:bg-samsung-blue-dark text-white disabled:opacity-60'
                  }`}
                >
                  {applied ? (
                    <><CheckCircle2 size={13} /> Applied</>
                  ) : applyingId === o.id ? (
                    <><Loader2 size={13} className="animate-spin" /> Applying…</>
                  ) : 'Apply'}
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
