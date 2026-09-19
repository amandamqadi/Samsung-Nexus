import { useEffect, useRef, useState } from 'react';
import { Minus, Send, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { AssistantMessage } from '../../types';

const QUICK_ACTIONS = [
  'What job opportunities are available?',
  'Tell me about upcoming hackathons',
  'How do I connect with fellow alumni?',
  'Switch theme to White or Dark',
];

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NexusAssistant() {
  const { theme, toggleTheme, opportunities, events } = useApp();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi! I'm Nexus AI. Ask me about opportunities, events, connecting with alumni, or say \"switch theme\".",
      timestamp: now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function respond(userText: string) {
    const lower = userText.toLowerCase();
    let reply = "I can help with opportunities, events, alumni connections, and theme preferences — try one of the quick actions below.";

    if (lower.includes('job') || lower.includes('opportunit') || lower.includes('internship')) {
      reply = `There are ${opportunities.length} open opportunities right now, including "${opportunities[0]?.title}" at ${opportunities[0]?.company}. Head to the Opportunities tab to filter by type and apply.`;
    } else if (lower.includes('hackathon') || lower.includes('event') || lower.includes('summit')) {
      const evt = events.find((e) => e.title.toLowerCase().includes('hackathon')) ?? events[0];
      reply = `${evt.title} is coming up on ${evt.date} (${evt.format}). You can RSVP directly from the Events tab.`;
    } else if (lower.includes('connect') || lower.includes('alumni') || lower.includes('network')) {
      reply = 'Visit the Community tab to search alumni by cohort year, track, or location — click "Connect" on any profile to reach out.';
    } else if (lower.includes('theme') || lower.includes('dark') || lower.includes('light') || lower.includes('white')) {
      toggleTheme();
      reply = `Done — I've switched you to the ${theme === 'dark' ? 'White' : 'Dark Pitch Black'} theme.`;
    }

    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, sender: 'assistant', text: reply, timestamp: now() }]);
      setTyping(false);
    }, 700);
  }

  function handleSend(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: value, timestamp: now() }]);
    setInput('');
    respond(value);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[90] flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-[92vw] sm:w-[380px] bg-card border border-hairline-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fade-in"
          style={{ height: minimized ? 'auto' : '520px' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-card-alt">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-glow" />
              <span className="text-sm font-display font-semibold text-primary">Nexus AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setMinimized((m) => !m)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card">
                <Minus size={14} />
              </button>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card">
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                      m.sender === 'user' ? 'bg-samsung-blue text-white rounded-br-sm' : 'bg-card-alt text-primary rounded-bl-sm'
                    }`}>
                      {m.text}
                      <div className={`text-[10px] mt-1 ${m.sender === 'user' ? 'text-white/60' : 'text-faint'}`}>{m.timestamp}</div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-card-alt rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-faint animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[11px] px-2.5 py-1.5 rounded-full border border-hairline text-muted hover:text-primary hover:border-hairline-strong transition-colors"
                  >
                    {q}
                  </button>
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
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nexus AI..."
                  className="flex-1 bg-card-alt border border-hairline rounded-full px-3.5 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
                <button type="submit" className="p-2.5 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white transition-colors">
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {!open && (
        <button
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          className="animate-pulse-ring flex items-center gap-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white pl-3.5 pr-4 py-3 shadow-xl transition-colors"
        >
          <Sparkles size={18} />
          <span className="text-sm font-semibold">Nexus AI</span>
        </button>
      )}
    </div>
  );
}
