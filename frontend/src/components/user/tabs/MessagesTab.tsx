import { useState } from 'react';
import { Send } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function MessagesTab() {
  const { conversations, sendMessage } = useApp();
  const [activeId, setActiveId] = useState(conversations[0]?.id);
  const [draft, setDraft] = useState('');

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  function handleSend() {
    if (!draft.trim() || !active) return;
    sendMessage(active.id, draft);
    setDraft('');
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>

      <div className="grid md:grid-cols-[280px_1fr] rounded-2xl border border-hairline bg-card overflow-hidden" style={{ height: '560px' }}>
        <div className="border-b md:border-b-0 md:border-r border-hairline overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-hairline last:border-0 transition-colors ${
                active?.id === c.id ? 'bg-card-alt' : 'hover:bg-card-alt'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-xs font-semibold shrink-0">
                {c.participantInitials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-primary truncate">{c.participantName}</p>
                  {c.unread > 0 && <span className="text-[10px] bg-samsung-blue text-white rounded-full w-4 h-4 flex items-center justify-center shrink-0">{c.unread}</span>}
                </div>
                <p className="text-[11px] text-faint truncate">{c.role}</p>
                <p className="text-[11px] text-muted truncate mt-0.5">{c.lastMessagePreview}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col min-h-0">
          {active && (
            <>
              <div className="px-4 py-3 border-b border-hairline flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-samsung-blue to-nexus-violet flex items-center justify-center text-white text-xs font-semibold">
                  {active.participantInitials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{active.participantName}</p>
                  <p className="text-[11px] text-faint">{active.role}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {active.messages.map((m) => (
                  <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.senderId === 'me' ? 'bg-samsung-blue text-white rounded-br-sm' : 'bg-card-alt text-primary rounded-bl-sm'
                    }`}>
                      {m.text}
                      <div className={`text-[10px] mt-1 ${m.senderId === 'me' ? 'text-white/60' : 'text-faint'}`}>{m.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 border-t border-hairline p-3"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message..."
                  className="flex-1 bg-card-alt border border-hairline rounded-full px-4 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
                <button type="submit" className="p-2.5 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white transition-colors">
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
