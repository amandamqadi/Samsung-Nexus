import { Handshake, Rocket, Sparkles, Users } from 'lucide-react';

const FEATURE_CARDS = [
  { icon: Users, title: 'Alumni Community', desc: 'Connect with 24,800+ verified graduates across 62 global cohorts, searchable by track, cohort, and location.', color: 'text-cyan-glow', ring: 'group-hover:border-cyan-glow/40' },
  { icon: Rocket, title: 'Opportunities', desc: 'Jobs, internships, and fellowships from Samsung and partner employers, matched to your skills and track.', color: 'text-nexus-emerald', ring: 'group-hover:border-nexus-emerald/40' },
  { icon: Handshake, title: 'Mentorship', desc: '98.4% successful mentor-mentee matching, plus speed-networking events across the whole alumni network.', color: 'text-nexus-violet', ring: 'group-hover:border-nexus-violet/40' },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Nexus AI, powered by Google Gemini, surfaces the communities, roles, and resources most relevant to you.', color: 'text-nexus-amber', ring: 'group-hover:border-nexus-amber/40' },
];

export default function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest text-cyan-glow uppercase">What you get</span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mt-3">Everything after graduation, in one place</h2>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          A single home for the community, opportunities, and guidance that keep your career moving.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURE_CARDS.map(({ icon: Icon, title, desc, color, ring }) => (
          <div
            key={title}
            className={`group rounded-2xl border border-hairline bg-card p-6 hover:-translate-y-1 transition-all duration-200 ${ring}`}
          >
            <div className="w-11 h-11 rounded-xl bg-card-alt border border-hairline flex items-center justify-center mb-4">
              <Icon className={color} size={20} />
            </div>
            <h3 className="font-display font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted mt-2 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
