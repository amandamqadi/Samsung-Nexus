import { Calendar, Users } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function EventsTab() {
  const { events, profile, toggleRsvp } = useApp();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Events</h1>
      <p className="text-sm text-muted mt-1 mb-6">Hackathons, summits, and webinars for the Samsung Nexus community</p>

      {events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline-strong p-10 text-center">
          <p className="text-sm text-muted">No events scheduled yet — check back soon.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {events.map((e) => {
          const rsvped = profile.rsvpedEventIds.includes(e.id);
          return (
          <div key={e.id} className="rounded-2xl border border-hairline bg-card p-5 hover:border-hairline-strong transition-colors flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                e.format === 'Virtual' ? 'border-cyan-glow/40 text-cyan-glow' : 'border-nexus-violet/40 text-nexus-violet'
              }`}>
                {e.format}
              </span>
              <span className="text-[11px] text-faint flex items-center gap-1"><Calendar size={12} /> {e.date}</span>
            </div>

            <h3 className="text-sm font-semibold text-primary">{e.title}</h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed flex-1">{e.description}</p>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
              <span className="text-[11px] text-faint flex items-center gap-1"><Users size={12} /> {e.attendeesCount} attending · by {e.postedBy}</span>
              <button
                onClick={() => toggleRsvp(e.id)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition-colors ${
                  rsvped ? 'bg-nexus-emerald/15 text-nexus-emerald' : 'bg-samsung-blue hover:bg-samsung-blue-dark text-white'
                }`}
              >
                {rsvped ? "You're going" : 'RSVP'}
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
