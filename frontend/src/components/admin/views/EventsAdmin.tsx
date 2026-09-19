import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';
import type { NexusEvent } from '../../../types';
import Modal, { ModalHeader } from '../../common/Modal';

export default function EventsAdmin({ view }: { view: AdminView }) {
  if (view === 'events.attendance') return <AttendanceView />;
  return <AllEventsView openCreateOnMount={view === 'events.create'} />;
}

function AllEventsView({ openCreateOnMount }: { openCreateOnMount: boolean }) {
  const { events } = useApp();
  const [modalOpen, setModalOpen] = useState(openCreateOnMount);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Events</h1>
          <p className="text-sm text-muted mt-1">{events.length} scheduled events</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((e) => (
          <div key={e.id} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${e.format === 'Virtual' ? 'border-cyan-glow/40 text-cyan-glow' : 'border-nexus-violet/40 text-nexus-violet'}`}>{e.format}</span>
              <span className="text-[11px] text-faint">{e.date}</span>
            </div>
            <p className="text-sm font-semibold text-primary">{e.title}</p>
            <p className="text-xs text-muted mt-1">{e.attendeesCount} attendees</p>
          </div>
        ))}
      </div>

      <EventSchedulerModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function EventSchedulerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addEvent } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [format, setFormat] = useState<NexusEvent['format']>('Virtual');

  function reset() {
    setTitle(''); setDescription(''); setDate(''); setFormat('Virtual');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    addEvent({ title, description, date, format });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader title="Schedule Event" subtitle="Publish a new webinar or summit" />
      <form onSubmit={handleSubmit} className="space-y-3">
        <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
        <div className="grid grid-cols-2 gap-3">
          <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue" />
          <select value={format} onChange={(e) => setFormat(e.target.value as NexusEvent['format'])} className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue">
            <option>Virtual</option>
            <option>In-Person</option>
          </select>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" rows={3} className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none" />
        <button type="submit" className="w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors">
          Publish Event
        </button>
      </form>
    </Modal>
  );
}

function AttendanceView() {
  const { events } = useApp();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">Attendance</h1>
      <p className="text-sm text-muted mb-6">RSVP counts across all scheduled events</p>
      <div className="rounded-2xl border border-hairline bg-card overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-hairline text-xs text-faint uppercase tracking-wide">
              <th className="text-left font-medium px-5 py-3">Event</th>
              <th className="text-left font-medium px-5 py-3">Date</th>
              <th className="text-left font-medium px-5 py-3">Format</th>
              <th className="text-left font-medium px-5 py-3">Attendees</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-hairline last:border-0 hover:bg-card-alt">
                <td className="px-5 py-3 font-medium text-primary">{e.title}</td>
                <td className="px-5 py-3 text-muted">{e.date}</td>
                <td className="px-5 py-3 text-muted">{e.format}</td>
                <td className="px-5 py-3 text-muted">{e.attendeesCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
