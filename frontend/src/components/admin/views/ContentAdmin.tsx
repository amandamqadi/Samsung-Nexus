import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';
import Modal, { ModalHeader } from '../../common/Modal';

const RESOURCES = [
  { title: 'Innovation Passport Setup Guide', type: 'PDF' },
  { title: 'Recruiter Verification Checklist', type: 'PDF' },
  { title: 'POPIA Consent Framework', type: 'Doc' },
  { title: 'Mentorship Programme Handbook', type: 'PDF' },
];

export default function ContentAdmin({ view }: { view: AdminView }) {
  if (view === 'content.resources') return <ResourcesView />;
  return <AnnouncementsView />;
}

function AnnouncementsView() {
  const { announcements, addAnnouncement } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    addAnnouncement({ title, body, author: 'Samsung Nexus Admin' });
    setTitle(''); setBody('');
    setModalOpen(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Announcements</h1>
          <p className="text-sm text-muted mt-1">Broadcast updates to the entire alumni network</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="rounded-2xl border border-hairline bg-card p-5">
            <p className="text-sm font-semibold text-primary">{a.title}</p>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{a.body}</p>
            <p className="text-[11px] text-faint mt-2">{a.date} · {a.author}</p>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-lg">
        <ModalHeader title="New Announcement" subtitle="Publish to all alumni feeds" />
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
          <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" rows={4} className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none" />
          <button type="submit" className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors">
            Broadcast Announcement
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ResourcesView() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Resources</h1>
      <p className="text-sm text-muted mb-6">Shared documents available to alumni and facilitators</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {RESOURCES.map((r) => (
          <div key={r.title} className="rounded-2xl border border-hairline bg-card p-5 flex items-center justify-between">
            <p className="text-sm font-medium text-primary">{r.title}</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-card-alt border border-hairline text-muted">{r.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
