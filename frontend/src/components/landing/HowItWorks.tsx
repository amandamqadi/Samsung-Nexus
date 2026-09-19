import { IdCard, Rocket, UsersRound } from 'lucide-react';

const STEPS = [
  {
    icon: IdCard,
    title: 'Create your Innovation Passport',
    description: 'Verify your Samsung Innovation Campus credentials and build a profile that captures your skills, track, and achievements.',
  },
  {
    icon: UsersRound,
    title: 'Discover community & opportunities',
    description: 'Search alumni by cohort and track, join discussions, and browse jobs, internships, and fellowships matched to you.',
  },
  {
    icon: Rocket,
    title: 'Grow with AI-powered guidance',
    description: 'Nexus AI recommends mentors, opportunities, and learning paths as your career evolves — no extra effort required.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs font-semibold tracking-widest text-cyan-glow uppercase">How it works</span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold mt-3">Three steps to a lifelong network</h2>
        <p className="text-sm text-muted mt-3 leading-relaxed">
          Samsung Nexus turns a one-time training programme into an ongoing professional relationship.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-transparent via-hairline-strong to-transparent" />
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <div key={title} className="relative rounded-2xl border border-hairline bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-samsung-blue/10 border border-samsung-blue/30 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-samsung-blue" />
              </div>
              <span className="font-display text-xs font-bold text-faint">STEP 0{i + 1}</span>
            </div>
            <h3 className="font-display font-semibold text-base text-primary">{title}</h3>
            <p className="text-sm text-muted mt-2 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
