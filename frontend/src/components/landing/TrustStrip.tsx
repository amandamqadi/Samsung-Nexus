const EMPLOYERS = ['Samsung Electronics', 'Vodacom', 'MTN Group', 'Standard Bank', 'Amazon Web Services', 'Naspers'];

export default function TrustStrip() {
  return (
    <section id="trust" className="border-y border-hairline bg-card-alt/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-center text-xs font-medium text-faint uppercase tracking-widest mb-6">
          Alumni now building careers at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {EMPLOYERS.map((name) => (
            <span key={name} className="text-sm sm:text-base font-display font-semibold text-muted/70">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
