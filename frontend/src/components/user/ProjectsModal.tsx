import { useState } from 'react';
import { ExternalLink, FolderGit2, Plus, Trash2 } from 'lucide-react';
import Modal, { ModalHeader } from '../common/Modal';
import { useApp } from '../../context/AppContext';

export default function ProjectsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { myProjects, addProject, removeProject } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    addProject({ title: title.trim(), description: description.trim(), link: link.trim() || undefined, tags });
    setTitle('');
    setDescription('');
    setLink('');
    setTagsInput('');
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-xl">
      <ModalHeader title="My Projects" subtitle="Showcase your work — visible to recruiters and Samsung administrators" />

      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
          className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you build?"
          rows={3}
          className="w-full rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none"
        />
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Link (GitHub, demo, etc.)"
            className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated)"
            className="rounded-lg bg-card-alt border border-hairline px-3 py-2.5 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add Project
        </button>
      </form>

      <div className="space-y-3">
        {myProjects.length === 0 && <p className="text-xs text-faint">No projects added yet.</p>}
        {myProjects.map((p) => (
          <div key={p.id} className="rounded-xl border border-hairline bg-card-alt p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FolderGit2 size={15} className="text-nexus-violet shrink-0" />
                <p className="text-sm font-semibold text-primary truncate">{p.title}</p>
              </div>
              <button onClick={() => removeProject(p.id)} className="p-1 rounded-lg text-muted hover:text-red-400 shrink-0" aria-label="Remove project">
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">{p.description}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-card border border-hairline text-muted">{t}</span>
              ))}
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" className="text-[11px] text-samsung-blue hover:text-cyan-glow flex items-center gap-0.5 ml-auto">
                  View <ExternalLink size={11} />
                </a>
              )}
            </div>
            <p className="text-[11px] text-faint mt-2">Added {p.createdDate}</p>
          </div>
        ))}
      </div>
    </Modal>
  );
}
