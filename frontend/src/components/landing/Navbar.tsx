import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const LANGUAGES = ['English (US)', '한국어', 'Español', 'Français', 'Deutsch', '日本語'];
const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'What you get', href: '#features' },
  { label: 'Community', href: '#trust' },
];

export default function Navbar() {
  const { setLoginModalOpen } = useApp();
  const [langOpen, setLangOpen] = useState(false);
  const [language, setLanguage] = useState('English (US)');

  return (
    <nav className="sticky top-0 z-40 border-b border-hairline bg-surface/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-samsung-blue flex items-center justify-center font-display font-bold text-white text-sm shrink-0">S</div>
          <div>
            <div className="font-display font-bold text-sm leading-none">
              SAMSUNG ALUMNI <span className="text-cyan-glow">NEXUS</span>
            </div>
            <div className="text-[11px] text-faint mt-0.5">Learn. Connect. Grow. Together.</div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="px-3 py-2 rounded-lg text-sm text-muted hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-primary px-2 py-1.5 rounded-lg"
            >
              <Globe size={16} /> {language}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-hairline bg-card shadow-xl overflow-hidden animate-fade-in">
                {LANGUAGES.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLanguage(l);
                      setLangOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-muted hover:bg-card-alt hover:text-primary"
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="hidden sm:block px-3.5 py-2 rounded-full text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-4 py-2 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold shadow-[0_0_0_1px_rgba(0,87,216,0.4),0_8px_24px_-8px_rgba(0,87,216,0.6)] transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </nav>
  );
}
