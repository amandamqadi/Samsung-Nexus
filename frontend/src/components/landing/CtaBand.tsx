import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CtaBand() {
  const { setLoginModalOpen } = useApp();

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-hairline bg-gradient-to-br from-samsung-blue/15 via-card to-card p-10 sm:p-14 text-center">
        <div className="absolute -top-16 right-0 w-72 h-72 rounded-full bg-cyan-glow/10 blur-[100px] pointer-events-none" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold relative z-10">Your Samsung Innovation Campus journey doesn't end at graduation</h2>
        <p className="text-sm sm:text-base text-muted mt-3 max-w-xl mx-auto relative z-10">
          Build your profile in minutes and start discovering opportunities, mentors, and peers the same day.
        </p>
        <button
          onClick={() => setLoginModalOpen(true)}
          className="group relative z-10 mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold shadow-[0_0_0_1px_rgba(0,87,216,0.4),0_12px_32px_-8px_rgba(0,87,216,0.7)] transition-colors"
        >
          Get started for free
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </section>
  );
}
