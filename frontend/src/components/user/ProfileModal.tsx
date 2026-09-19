import { useRef, useState } from 'react';
import {
  Award, Briefcase, Camera, Download, FileText, FolderGit2, GraduationCap, IdCard, Languages,
  Link2, Loader2, MapPin, MessageSquareQuote, Pencil, ShieldCheck, Trash2, Upload, HeartHandshake,
} from 'lucide-react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import type { DocumentType } from '../../types';
import { LANGUAGE_PROFICIENCIES } from '../../types';
import EntrySection from './profile/EntrySection';
import SkillsSection from './profile/SkillsSection';

const DOC_TYPES: DocumentType[] = ['ID Document', 'CV / Resume', 'Certificate', 'Other'];

const DOC_ICON: Record<DocumentType, typeof IdCard> = {
  'ID Document': IdCard,
  'CV / Resume': Briefcase,
  Certificate: Award,
  Other: FileText,
};

export default function ProfileModal({ open, onClose, onOpenProjects }: { open: boolean; onClose: () => void; onOpenProjects: () => void }) {
  const {
    currentUser, myDocuments, documentsLoading, addDocument, removeDocument,
    myProjects, profile, profileLoading, updateProfileFields, uploadProfileImage, showToast,
  } = useApp();

  const [docType, setDocType] = useState<DocumentType>('ID Document');
  const [uploading, setUploading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState<'avatar' | 'banner' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [identityDraft, setIdentityDraft] = useState({
    headline: profile.headline, location: profile.location, industry: profile.industry,
    websiteUrl: profile.websiteUrl, customUrlSlug: profile.customUrlSlug,
  });
  const [aboutDraft, setAboutDraft] = useState(profile.about);

  function openIdentityEditor() {
    setIdentityDraft({
      headline: profile.headline, location: profile.location, industry: profile.industry,
      websiteUrl: profile.websiteUrl, customUrlSlug: profile.customUrlSlug,
    });
    setEditingIdentity(true);
  }

  async function saveIdentity(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfileFields(identityDraft);
      setEditingIdentity(false);
    } catch (err) {
      console.error('failed to save identity', err);
      showToast('Could not save — please try again');
    }
  }

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfileFields({ about: aboutDraft });
      setEditingAbout(false);
    } catch (err) {
      console.error('failed to save about', err);
      showToast('Could not save — please try again');
    }
  }

  async function handleImageSelected(e: React.ChangeEvent<HTMLInputElement>, kind: 'avatar' | 'banner') {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImageUploading(kind);
    try {
      await uploadProfileImage(file, kind);
    } catch (err) {
      console.error('image upload failed', err);
      showToast('Upload failed — please try again');
    } finally {
      setImageUploading(null);
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    try {
      await addDocument(file, docType);
    } catch (err) {
      console.error('document upload failed', err);
      showToast('Upload failed — please try again');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeDocument(id);
    } catch (err) {
      console.error('document removal failed', err);
      showToast('Could not remove — please try again');
    } finally {
      setRemovingId(null);
    }
  }

  const initials = currentUser?.name.split(' ').map((n) => n[0]).join('') ?? '';

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl" noPadding>
      <div>
        {/* Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-samsung-blue via-[#0A1650] to-black overflow-hidden">
          {profile.bannerUrl && <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-dot-grid opacity-20" />
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={imageUploading === 'banner'}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs hover:bg-black/60 transition-colors disabled:opacity-60"
          >
            {imageUploading === 'banner' ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
            Banner
          </button>
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e, 'banner')} />
        </div>

        <div className="px-6 sm:px-8">
          {/* Avatar overlapping banner */}
          <div className="relative -mt-10 mb-3 flex items-end justify-between">
            <div className="relative w-20 h-20 rounded-full border-4 border-card bg-gradient-to-br from-samsung-blue to-cyan-glow flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
              {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={imageUploading === 'avatar'}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                aria-label="Change profile photo"
              >
                {imageUploading === 'avatar' ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelected(e, 'avatar')} />
          </div>

          {/* Identity */}
          {!editingIdentity ? (
            <div className="relative pb-5 border-b border-hairline">
              <button
                onClick={openIdentityEditor}
                className="absolute top-0 right-0 p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card-alt"
                aria-label="Edit profile details"
              >
                <Pencil size={14} />
              </button>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-display font-semibold text-primary">{currentUser?.name}</h2>
                {currentUser?.idVerified && <ShieldCheck size={15} className="text-nexus-emerald" />}
              </div>
              <p className="text-sm text-muted mt-0.5">{profile.headline || 'Add a headline to introduce yourself'}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-faint">
                {profile.location && <span className="flex items-center gap-1"><MapPin size={11} /> {profile.location}</span>}
                {profile.industry && <span>{profile.industry}</span>}
                {profile.websiteUrl && (
                  <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-samsung-blue hover:text-cyan-glow">
                    <Link2 size={11} /> Website
                  </a>
                )}
                {profile.customUrlSlug && <span>nexus.samsung.com/in/{profile.customUrlSlug}</span>}
              </div>
              <p className="text-xs text-faint mt-1.5">{currentUser?.email} · Class of {currentUser?.cohortYear} · {currentUser?.track}</p>
            </div>
          ) : (
            <form onSubmit={saveIdentity} className="pb-5 border-b border-hairline space-y-3">
              <input
                value={identityDraft.headline}
                onChange={(e) => setIdentityDraft((p) => ({ ...p, headline: e.target.value }))}
                placeholder="Headline — e.g. AI Engineer · Samsung Innovation Campus Alumni"
                className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  value={identityDraft.location}
                  onChange={(e) => setIdentityDraft((p) => ({ ...p, location: e.target.value }))}
                  placeholder="Location"
                  className="rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
                <input
                  value={identityDraft.industry}
                  onChange={(e) => setIdentityDraft((p) => ({ ...p, industry: e.target.value }))}
                  placeholder="Industry"
                  className="rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
                <input
                  value={identityDraft.websiteUrl}
                  onChange={(e) => setIdentityDraft((p) => ({ ...p, websiteUrl: e.target.value }))}
                  placeholder="Website / portfolio URL"
                  className="rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
                <input
                  value={identityDraft.customUrlSlug}
                  onChange={(e) => setIdentityDraft((p) => ({ ...p, customUrlSlug: e.target.value.replace(/\s+/g, '-').toLowerCase() }))}
                  placeholder="Custom URL — e.g. john-doe"
                  className="rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingIdentity(false)} className="px-3.5 py-1.5 rounded-lg text-xs text-muted hover:text-primary">Cancel</button>
                <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-xs font-semibold transition-colors">Save</button>
              </div>
            </form>
          )}

          {/* About */}
          <div className="border-t border-hairline pt-5 pb-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-primary">About</h3>
              {!editingAbout && (
                <button onClick={() => { setAboutDraft(profile.about); setEditingAbout(true); }} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-card-alt" aria-label="Edit about">
                  <Pencil size={13} />
                </button>
              )}
            </div>
            {editingAbout ? (
              <form onSubmit={saveAbout} className="space-y-2">
                <textarea
                  value={aboutDraft}
                  onChange={(e) => setAboutDraft(e.target.value)}
                  rows={4}
                  placeholder="Share your professional journey, core competencies, and career ambitions..."
                  className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditingAbout(false)} className="px-3.5 py-1.5 rounded-lg text-xs text-muted hover:text-primary">Cancel</button>
                  <button type="submit" className="px-3.5 py-1.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-xs font-semibold transition-colors">Save</button>
                </div>
              </form>
            ) : (
              <p className="text-sm text-muted leading-relaxed">{profile.about || 'Add a summary to tell your story.'}</p>
            )}
          </div>

          {profileLoading && <p className="text-xs text-faint border-t border-hairline pt-5 mt-0">Loading profile…</p>}

          <SkillsSection />

          <EntrySection
            section="experience"
            title="Experience"
            icon={Briefcase}
            items={profile.experience}
            emptyLabel="No experience added yet."
            fields={[
              { name: 'title', label: 'Title', type: 'text', half: true, placeholder: 'AI Engineer' },
              { name: 'company', label: 'Company', type: 'text', half: true, placeholder: 'Samsung Electronics' },
              { name: 'startDate', label: 'Start date', type: 'date', half: true },
              { name: 'endDate', label: 'End date', type: 'date', half: true },
              { name: 'current', label: 'I currently work here', type: 'checkbox' },
              { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Key responsibilities and achievements' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="text-sm font-medium text-primary">{item.title}</p>
                <p className="text-xs text-muted">{item.company}</p>
                <p className="text-[11px] text-faint mt-0.5">{item.startDate || '—'} – {item.current ? 'Present' : (item.endDate || '—')}</p>
                {item.description && <p className="text-xs text-muted mt-1.5 leading-relaxed">{item.description}</p>}
              </>
            )}
          />

          <EntrySection
            section="education"
            title="Education"
            icon={GraduationCap}
            items={profile.education}
            emptyLabel="No education added yet."
            fields={[
              { name: 'school', label: 'School', type: 'text', half: true, placeholder: 'Durban University of Technology' },
              { name: 'degree', label: 'Degree', type: 'text', half: true, placeholder: 'Diploma' },
              { name: 'field', label: 'Field of study', type: 'text', half: true, placeholder: 'AI & Robotics' },
              { name: 'startYear', label: 'Start year', type: 'text', half: true, placeholder: '2022' },
              { name: 'endYear', label: 'End year', type: 'text', half: true, placeholder: '2024' },
              { name: 'highlights', label: 'Highlights', type: 'textarea', placeholder: 'Activities, societies, honors' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="text-sm font-medium text-primary">{item.school}</p>
                <p className="text-xs text-muted">{item.degree}{item.field ? `, ${item.field}` : ''}</p>
                <p className="text-[11px] text-faint mt-0.5">{item.startYear || '—'} – {item.endYear || '—'}</p>
                {item.highlights && <p className="text-xs text-muted mt-1.5 leading-relaxed">{item.highlights}</p>}
              </>
            )}
          />

          <EntrySection
            section="certifications"
            title="Licenses & Certifications"
            icon={Award}
            items={profile.certifications}
            emptyLabel="No certifications added yet."
            fields={[
              { name: 'name', label: 'Certification name', type: 'text', half: true, placeholder: 'Google Data Analytics' },
              { name: 'issuer', label: 'Issuing organization', type: 'text', half: true, placeholder: 'Google' },
              { name: 'issueDate', label: 'Issue date', type: 'date', half: true },
              { name: 'credentialId', label: 'Credential ID', type: 'text', half: true },
            ]}
            renderSummary={(item) => (
              <>
                <p className="text-sm font-medium text-primary">{item.name}</p>
                <p className="text-xs text-muted">{item.issuer}</p>
                <p className="text-[11px] text-faint mt-0.5">{item.issueDate}{item.credentialId ? ` · ID: ${item.credentialId}` : ''}</p>
              </>
            )}
          />

          {/* Projects — reuses the dedicated My Projects modal */}
          <div className="border-t border-hairline pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <FolderGit2 size={15} className="text-cyan-glow" /> Projects
              </h3>
              <button
                onClick={onOpenProjects}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-hairline text-muted hover:text-primary hover:border-cyan-glow/50 transition-colors"
              >
                Manage
              </button>
            </div>
            {myProjects.length === 0 ? (
              <p className="text-xs text-faint">No projects added yet.</p>
            ) : (
              <div className="space-y-2">
                {myProjects.slice(0, 3).map((p) => (
                  <div key={p.id} className="rounded-lg border border-hairline bg-card-alt px-3.5 py-3">
                    <p className="text-sm font-medium text-primary">{p.title}</p>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{p.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <EntrySection
            section="recommendations"
            title="Recommendations"
            icon={MessageSquareQuote}
            items={profile.recommendations}
            emptyLabel="No recommendations yet."
            fields={[
              { name: 'authorName', label: 'From', type: 'text', half: true, placeholder: 'Sicelo Mthanti' },
              { name: 'authorRole', label: 'Their role', type: 'text', half: true, placeholder: 'Lead AI Architect' },
              { name: 'date', label: 'Date', type: 'date', half: true },
              { name: 'text', label: 'Recommendation', type: 'textarea', placeholder: '"John consistently delivered..."' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="text-sm text-muted italic leading-relaxed">"{item.text}"</p>
                <p className="text-[11px] text-faint mt-1.5">— {item.authorName}{item.authorRole ? `, ${item.authorRole}` : ''}{item.date ? ` · ${item.date}` : ''}</p>
              </>
            )}
          />

          <EntrySection
            section="publications"
            title="Publications & Honors"
            icon={Award}
            items={profile.publications}
            emptyLabel="No publications or honors added yet."
            fields={[
              { name: 'kind', label: 'Type', type: 'select', options: ['Publication', 'Honor'], half: true },
              { name: 'title', label: 'Title', type: 'text', half: true, placeholder: 'Efficient On-Device AI Models' },
              { name: 'publisher', label: 'Publisher / Issuer', type: 'text', half: true },
              { name: 'date', label: 'Date', type: 'date', half: true },
              { name: 'url', label: 'Link', type: 'text', placeholder: 'https://...' },
            ]}
            renderSummary={(item) => (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-card border border-hairline text-faint">{item.kind}</span>
                  <p className="text-sm font-medium text-primary">{item.title}</p>
                </div>
                <p className="text-[11px] text-faint mt-1">{item.publisher}{item.date ? ` · ${item.date}` : ''}</p>
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-samsung-blue hover:text-cyan-glow">View link</a>}
              </>
            )}
          />

          <EntrySection
            section="volunteer"
            title="Volunteer Experience"
            icon={HeartHandshake}
            items={profile.volunteer}
            emptyLabel="No volunteer experience added yet."
            fields={[
              { name: 'role', label: 'Role', type: 'text', half: true, placeholder: 'Mentor' },
              { name: 'organization', label: 'Organization', type: 'text', half: true, placeholder: 'DUT Innovation Campus' },
              { name: 'cause', label: 'Cause', type: 'text', half: true, placeholder: 'Education' },
              { name: 'startDate', label: 'Start date', type: 'date', half: true },
              { name: 'endDate', label: 'End date', type: 'date', half: true },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            renderSummary={(item) => (
              <>
                <p className="text-sm font-medium text-primary">{item.role}</p>
                <p className="text-xs text-muted">{item.organization}{item.cause ? ` · ${item.cause}` : ''}</p>
                <p className="text-[11px] text-faint mt-0.5">{item.startDate || '—'} – {item.endDate || 'Present'}</p>
                {item.description && <p className="text-xs text-muted mt-1.5 leading-relaxed">{item.description}</p>}
              </>
            )}
          />

          <EntrySection
            section="languages"
            title="Languages"
            icon={Languages}
            items={profile.languages}
            emptyLabel="No languages added yet."
            fields={[
              { name: 'name', label: 'Language', type: 'text', half: true, placeholder: 'isiZulu' },
              { name: 'proficiency', label: 'Proficiency', type: 'select', options: LANGUAGE_PROFICIENCIES, half: true },
            ]}
            renderSummary={(item) => (
              <p className="text-sm text-primary">{item.name} <span className="text-xs text-faint">· {item.proficiency}</span></p>
            )}
          />

          {/* Documents */}
          <div className="border-t border-hairline pt-5 pb-6">
            <h3 className="text-sm font-semibold text-primary mb-1">Documents</h3>
            <p className="text-xs text-muted mb-4">
              Upload your ID, CV, certificates, and other supporting documents. Visible to Samsung administrators during verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocumentType)}
                className="rounded-lg bg-card-alt border border-hairline px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue"
              >
                {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-hairline-strong px-3 py-2 text-sm text-muted hover:text-primary hover:border-cyan-glow transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                {uploading ? 'Uploading…' : `Upload as "${docType}"`}
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
            </div>

            <div className="space-y-2">
              {documentsLoading && <p className="text-xs text-faint">Loading documents…</p>}
              {!documentsLoading && myDocuments.length === 0 && <p className="text-xs text-faint">No documents uploaded yet.</p>}
              {myDocuments.map((d) => {
                const Icon = DOC_ICON[d.docType];
                return (
                  <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-card-alt px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={16} className="text-cyan-glow shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-primary truncate">{d.fileName}</p>
                        <p className="text-[11px] text-faint">
                          {d.docType} · {d.sizeLabel} · {d.uploadedDate}
                          {!d.url && <span className="text-nexus-amber"> · upload pending</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {d.url && (
                        <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg text-muted hover:text-cyan-glow hover:bg-card" aria-label="View document">
                          <Download size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => handleRemove(d.id)}
                        disabled={removingId === d.id}
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-card disabled:opacity-50"
                        aria-label="Remove document"
                      >
                        {removingId === d.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
