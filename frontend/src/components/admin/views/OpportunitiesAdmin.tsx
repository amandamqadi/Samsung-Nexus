import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';
import type { OpportunityType } from '../../../types';
import Modal, { ModalHeader } from '../../common/Modal';

export default function OpportunitiesAdmin({ view }: { view: AdminView }) {
  if (view === 'opportunities.applications') return <ApplicationsView />;
  return <AllOpportunitiesView openAddOnMount={view === 'opportunities.add'} />;
}

function AllOpportunitiesView({ openAddOnMount }: { openAddOnMount: boolean }) {
  const { opportunities } = useApp();
  const [modalOpen, setModalOpen] = useState(openAddOnMount);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Opportunities</h1>
          <p className="text-sm text-muted mt-1">{opportunities.length} listings live on the alumni feed</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Add Opportunity
        </button>
      </div>

      <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Title</th>
              <th className="text-left font-medium px-5 py-3">Company</th>
              <th className="text-left font-medium px-5 py-3">Type</th>
              <th className="text-left font-medium px-5 py-3">Location</th>
              <th className="text-left font-medium px-5 py-3">Applicants</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.map((o) => (
              <tr key={o.id} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                <td className="px-5 py-3 font-medium text-primary">{o.title}</td>
                <td className="px-5 py-3 text-muted">{o.company}</td>
                <td className="px-5 py-3 text-muted">{o.type}</td>
                <td className="px-5 py-3 text-muted">{o.location}</td>
                <td className="px-5 py-3 text-muted">{o.applicantsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OpportunityPublisherModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function OpportunityPublisherModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addOpportunity } = useApp();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<OpportunityType>('Full-time');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');

  function reset() {
    setTitle(''); setCompany(''); setType('Full-time'); setLocation(''); setSalaryRange(''); setDescription('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !company) return;
    addOpportunity({ title, company, type, location, salaryRange, description });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader title="Publish Opportunity" subtitle="Post directly to the alumni feed" />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
        <input required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
        <div className="grid grid-cols-2 gap-3">
          <select value={type} onChange={(e) => setType(e.target.value as OpportunityType)} className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
            <option>Full-time</option>
            <option>Internship</option>
            <option>Fellowship</option>
          </select>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
        </div>
        <input value={salaryRange} onChange={(e) => setSalaryRange(e.target.value)} placeholder="Salary range" className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none" />
        <button type="submit" className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors">
          Publish to Alumni Feed
        </button>
      </form>
    </Modal>
  );
}

function ApplicationsView() {
  const { opportunities, applications } = useApp();
  const applied = opportunities.filter((o) => o.applicantsCount > 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Applications</h1>
      <p className="text-sm text-muted mb-6">Applicant volume across live opportunity listings</p>
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {applied.map((o) => (
          <div key={o.id} className="rounded-2xl border border-hairline bg-card p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">{o.title}</p>
              <p className="text-xs text-muted mt-0.5">{o.company} · {o.type}</p>
            </div>
            <span className="text-sm font-display font-bold text-cyan-glow">{o.applicantsCount} applicants</span>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold mb-3">Applications submitted through Nexus</h2>
      <p className="text-xs text-muted mb-4">
        These are pulled directly from each alumnus's profile at the moment they applied — name, headline, skills, and CV.
      </p>
      <div className="space-y-3">
        {applications.length === 0 && <p className="text-xs text-faint">No applications submitted yet.</p>}
        {applications.map((a) => (
          <div key={a.id} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary">{a.applicantName}</p>
                <p className="text-xs text-muted mt-0.5">{a.headline || a.applicantEmail}</p>
                <p className="text-[11px] text-faint mt-1">Applied to <span className="text-primary">{a.opportunityTitle}</span> · {a.company} · {a.appliedDate}</p>
                {a.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {a.skills.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              {a.cvUrl ? (
                <a href={a.cvUrl} target="_blank" rel="noreferrer" className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-hairline text-muted hover:text-cyan-glow hover:border-cyan-glow/50 transition-colors">
                  View CV
                </a>
              ) : (
                <span className="shrink-0 text-[11px] text-faint">No CV on file</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
