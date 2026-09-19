import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';

const TABS = [
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'cookies', label: 'Cookie Policy' },
  { key: 'disclaimer', label: 'Disclaimer' },
  { key: 'accessibility', label: 'Accessibility' },
] as const;

const CONTENT: Record<(typeof TABS)[number]['key'], { title: string; body: string[] }> = {
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Samsung Electronics Co., Ltd. ("Samsung", "we", "us") is committed to protecting the personal information of Samsung Nexus alumni in accordance with the Protection of Personal Information Act (POPIA) and Samsung Knox data protection standards.',
      'We collect profile data, engagement activity, and opportunity applications solely to operate the alumni platform, measure programme outcomes, and connect alumni with relevant career opportunities. Explicit consent is captured at registration, and alumni retain full control over profile visibility via privacy toggles.',
      'Personal information is never sold to third parties. Recruiters and partner organisations may only access alumni data that individual users have explicitly made visible to that audience.',
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    body: [
      'By creating a Samsung Nexus account, you agree to provide accurate information and to use the platform in a manner consistent with the Samsung Innovation Campus Code of Conduct.',
      'Accounts found to misrepresent alumni status, post misleading opportunities, or engage in harassment within the community may be suspended or permanently removed at Samsung\'s discretion.',
      'Samsung Nexus is provided "as is" during its prototype and pilot phases. Features, availability, and data retention policies may evolve as the platform scales across cohorts and institutions.',
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    body: [
      'Samsung Nexus uses essential cookies to maintain your session, remember theme preferences, and secure authentication tokens.',
      'Analytics cookies help us understand feature usage in aggregate to improve mentorship matching, opportunity relevance, and community engagement — never to identify individuals to third parties.',
      'You may clear cookies at any time via your browser settings; doing so will require you to sign in again.',
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    body: [
      'Job listings, fellowships, and internships displayed on Samsung Nexus are submitted by verified partner organisations and Samsung divisions. While recruiters undergo a vetting process, Samsung does not guarantee employment outcomes.',
      'AI-generated recommendations, including those from the Nexus Assistant, are provided as guidance only and should be validated against your own judgement and research.',
    ],
  },
  accessibility: {
    title: 'Accessibility',
    body: [
      'Samsung Nexus is designed as a mobile-friendly, data-efficient progressive web platform accessible across low-bandwidth networks and a wide range of devices.',
      'We aim to meet WCAG 2.1 AA standards, including keyboard navigability, sufficient colour contrast in both Dark and Light themes, and screen-reader-friendly labelling across interactive components.',
      'If you encounter an accessibility barrier, please contact the Samsung Innovation Campus programme team so we can address it.',
    ],
  },
};

export default function LegalModal() {
  const { legalModalOpen, openLegalModal, closeLegalModal } = useApp();
  if (!legalModalOpen) return null;
  const active = CONTENT[legalModalOpen];

  return (
    <Modal open={!!legalModalOpen} onClose={closeLegalModal} maxWidth="max-w-2xl">
      <div className="flex flex-wrap gap-1.5 mb-6 border-b border-hairline pb-4">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => openLegalModal(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              legalModalOpen === t.key
                ? 'bg-samsung-blue text-white'
                : 'bg-card-alt text-muted hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-display font-semibold text-primary mb-4">{active.title}</h2>
      <div className="space-y-3 text-sm text-muted leading-relaxed max-h-[45vh] overflow-y-auto pr-2">
        {active.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <button
        onClick={closeLegalModal}
        className="mt-6 w-full py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
      >
        I Understand
      </button>
    </Modal>
  );
}
