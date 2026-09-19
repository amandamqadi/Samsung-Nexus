import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { openLegalModal } = useApp();

  return (
    <footer className="border-t border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-samsung-blue flex items-center justify-center font-display font-bold text-white text-xs">S</div>
            <span className="font-display font-bold text-xs">
              SAMSUNG ALUMNI <span className="text-cyan-glow">NEXUS</span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted">
            <button onClick={() => openLegalModal('privacy')} className="hover:text-primary transition-colors">Privacy Policy</button>
            <button onClick={() => openLegalModal('terms')} className="hover:text-primary transition-colors">Terms & Conditions</button>
            <button onClick={() => openLegalModal('cookies')} className="hover:text-primary transition-colors">Cookie Policy</button>
            <button onClick={() => openLegalModal('disclaimer')} className="hover:text-primary transition-colors">Disclaimer</button>
            <button onClick={() => openLegalModal('accessibility')} className="hover:text-primary transition-colors">Accessibility</button>
          </div>
          <p className="text-[11px] text-faint text-center">© 2026 Samsung Electronics Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
