import { ArrowRight, Briefcase, Globe2, Handshake, Sparkles, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PLATFORM_METRICS } from '../../data/mockData';

const METRICS = [
  { icon: Users, value: `${(PLATFORM_METRICS.totalAlumni / 1000).toFixed(1)}K+`, label: 'Verified Alumni' },
  { icon: Globe2, value: `${PLATFORM_METRICS.globalCohorts}`, label: 'Global Cohorts' },
  { icon: Handshake, value: `${PLATFORM_METRICS.mentorshipMatch}%`, label: 'Mentorship Match' },
  { icon: Sparkles, value: `${PLATFORM_METRICS.careerPlacement}%`, label: 'Career Placement' },
];

const ORBIT_ICONS = [
  { icon: Users, color: 'text-cyan-glow', border: 'border-cyan-glow/40', radius: 108, duration: '18s', delay: '0s', angle: 20 },
  { icon: Briefcase, color: 'text-nexus-emerald', border: 'border-nexus-emerald/40', radius: 108, duration: '18s', delay: '-6s', angle: 140 },
  { icon: Sparkles, color: 'text-nexus-amber', border: 'border-nexus-amber/40', radius: 108, duration: '18s', delay: '-12s', angle: 260 },
];

export default function Hero() {
  const { setLoginModalOpen } = useApp();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid mask-fade-bottom opacity-[0.35] pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[640px] rounded-full bg-samsung-blue/20 blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cyan-glow/30 bg-cyan-glow/5 text-cyan-glow text-xs font-medium mb-6">
          <Sparkles size={13} /> Now welcoming Cohort 62 · DUT × Samsung Innovation Campus
        </div>

        <h1 className="font-display font-bold text-4xl sm:text-6xl leading-tight tracking-tight">
          <span className="block text-primary">WELCOME TO</span>
          <span className="block gradient-text">SAMSUNG NEXUS</span>
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Stay connected with our alumni community, share experiences, and build meaningful relationships that last.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setLoginModalOpen(true)}
            className="group w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold shadow-[0_0_0_1px_rgba(0,87,216,0.4),0_12px_32px_-8px_rgba(0,87,216,0.7)] transition-colors"
          >
            Get started
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-hairline-strong text-sm font-medium text-primary hover:bg-card-alt transition-colors text-center"
          >
            See how it works
          </a>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {METRICS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group rounded-2xl border border-hairline bg-card p-4 sm:p-5 text-left hover:border-cyan-glow/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Icon size={16} className="text-cyan-glow mb-2.5" />
              <div className="font-display text-xl sm:text-2xl font-bold text-primary">{value}</div>
              <div className="text-[11px] sm:text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-20">
        <div className="rounded-3xl border border-hairline bg-card-alt/40 h-[260px] sm:h-[320px] flex items-center justify-center overflow-hidden">
          <div className="relative w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-samsung-blue/10 blur-2xl" />
            <div className="absolute inset-0 rounded-full border border-hairline-strong border-dashed animate-[spin_60s_linear_infinite]" />

            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center shadow-[0_0_60px_-8px_rgba(0,229,255,0.55)] animate-float-slow">
              <Handshake size={32} className="text-white" />
            </div>

            {ORBIT_ICONS.map(({ icon: Icon, color, border, radius, duration, delay, angle }, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-0 h-0"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div
                  className="animate-orbit"
                  style={{ ['--orbit-radius' as string]: `${radius}px`, animationDuration: duration, animationDelay: delay }}
                >
                  <div
                    className={`w-9 h-9 -ml-4.5 -mt-4.5 rounded-full bg-card border ${border} flex items-center justify-center shadow-lg`}
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    <Icon size={15} className={color} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-sm text-muted mt-6 max-w-md mx-auto">
          <span className="text-primary font-medium">Where Hands Touch</span> — human talent meeting advanced technology, the union that powers every connection made on Samsung Nexus.
        </p>
      </div>
    </section>
  );
}
