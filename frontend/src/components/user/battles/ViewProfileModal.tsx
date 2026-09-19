import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Briefcase, GraduationCap, Link2, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import Modal from '../../common/Modal';
import { db } from '../../../firebase';
import { EMPTY_PROFILE, type CurrentUser, type ExtendedProfile } from '../../../types';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export default function ViewProfileModal({ user, onClose }: { user: CurrentUser; onClose: () => void }) {
  const [profile, setProfile] = useState<ExtendedProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDoc(doc(db, 'profiles', user.uid))
      .then((snap) => {
        if (cancelled) return;
        setProfile(snap.exists() ? { ...EMPTY_PROFILE, ...(snap.data() as Partial<ExtendedProfile>) } : EMPTY_PROFILE);
      })
      .catch((err) => console.error('failed to load opponent profile', err))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [user.uid]);

  return (
    <Modal open onClose={onClose} maxWidth="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center text-white text-xl font-semibold overflow-hidden shrink-0">
          {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials(user.name)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-display font-semibold text-primary truncate">{user.name}</h2>
            {user.idVerified && <ShieldCheck size={15} className="text-nexus-emerald shrink-0" />}
          </div>
          <p className="text-sm text-muted truncate">{profile.headline || `Class of ${user.cohortYear} · ${user.track}`}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-faint">
            {profile.location && <span className="flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>}
            {profile.websiteUrl && (
              <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-samsung-blue hover:text-cyan-glow">
                <Link2 size={11} /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {loading && <p className="text-xs text-faint">Loading profile...</p>}

      {!loading && (
        <div className="space-y-5">
          {profile.about && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-1.5">About</h3>
              <p className="text-sm text-primary leading-relaxed">{profile.about}</p>
            </div>
          )}

          {profile.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><Wrench size={12} /> Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s.id} className={`text-[11px] px-2.5 py-1 rounded-full border ${s.pinned ? 'border-cyan-glow/50 bg-cyan-glow/10 text-cyan-glow' : 'border-hairline text-muted'}`}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.experience.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><Briefcase size={12} /> Experience</h3>
              <div className="space-y-2">
                {profile.experience.slice(0, 3).map((e) => (
                  <div key={e.id} className="rounded-lg border border-hairline bg-card-alt px-3 py-2">
                    <p className="text-sm font-medium text-primary">{e.title}</p>
                    <p className="text-xs text-muted">{e.company}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.education.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-2 flex items-center gap-1.5"><GraduationCap size={12} /> Education</h3>
              <div className="space-y-2">
                {profile.education.slice(0, 2).map((e) => (
                  <div key={e.id} className="rounded-lg border border-hairline bg-card-alt px-3 py-2">
                    <p className="text-sm font-medium text-primary">{e.school}</p>
                    <p className="text-xs text-muted">{e.degree}{e.field ? `, ${e.field}` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!profile.about && profile.skills.length === 0 && profile.experience.length === 0 && profile.education.length === 0 && (
            <p className="text-xs text-faint">{user.name.split(' ')[0]} hasn't filled out their Innovation Passport yet.</p>
          )}
        </div>
      )}
    </Modal>
  );
}
