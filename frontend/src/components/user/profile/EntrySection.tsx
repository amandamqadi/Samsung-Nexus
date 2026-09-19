import { useState, type ReactNode } from 'react';
import { Plus, Trash2, type LucideIcon } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { ProfileListKey, ProfileListMap } from '../../../types';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'checkbox' | 'select';
  options?: readonly string[];
  placeholder?: string;
  half?: boolean;
}

interface EntrySectionProps<K extends ProfileListKey> {
  section: K;
  title: string;
  icon: LucideIcon;
  items: ProfileListMap[K][];
  fields: FieldConfig[];
  emptyLabel: string;
  renderSummary: (item: ProfileListMap[K]) => ReactNode;
}

export default function EntrySection<K extends ProfileListKey>({
  section, title, icon: Icon, items, fields, emptyLabel, renderSummary,
}: EntrySectionProps<K>) {
  const { addProfileEntry, removeProfileEntry, showToast } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function setField(name: string, value: string | boolean) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const entry = Object.fromEntries(
        fields.map((f) => [f.name, values[f.name] ?? (f.type === 'checkbox' ? false : '')]),
      ) as unknown as Omit<ProfileListMap[K], 'id'>;
      await addProfileEntry(section, entry);
      setValues({});
      setFormOpen(false);
    } catch (err) {
      console.error(`failed to add ${section} entry`, err);
      showToast('Could not save — please try again');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeProfileEntry(section, id);
    } catch (err) {
      console.error(`failed to remove ${section} entry`, err);
      showToast('Could not remove — please try again');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="border-t border-hairline pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Icon size={15} className="text-cyan-glow" /> {title}
        </h3>
        <button
          type="button"
          onClick={() => setFormOpen((v) => !v)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border border-hairline text-muted hover:text-primary hover:border-cyan-glow/50 transition-colors"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-hairline bg-card-alt p-4 mb-4 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
                {f.type !== 'checkbox' && <label className="block text-xs font-medium text-muted mb-1.5">{f.label}</label>}
                {f.type === 'textarea' ? (
                  <textarea
                    value={(values[f.name] as string) ?? ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full rounded-lg bg-card border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue resize-none"
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={(values[f.name] as string) ?? ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className="w-full rounded-lg bg-card border border-hairline px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                  >
                    <option value="" disabled>Select...</option>
                    {f.options?.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm text-muted pt-6">
                    <input
                      type="checkbox"
                      checked={(values[f.name] as boolean) ?? false}
                      onChange={(e) => setField(f.name, e.target.checked)}
                      className="rounded border-hairline"
                    />
                    {f.label}
                  </label>
                ) : (
                  <input
                    type={f.type}
                    value={(values[f.name] as string) ?? ''}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded-lg bg-card border border-hairline px-3 py-2 text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-samsung-blue"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs text-muted hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg bg-samsung-blue hover:bg-samsung-blue-dark text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-faint">{emptyLabel}</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border border-hairline bg-card-alt px-3.5 py-3">
            <div className="min-w-0 flex-1">{renderSummary(item)}</div>
            <button
              onClick={() => handleRemove(item.id)}
              disabled={removingId === item.id}
              className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-card disabled:opacity-50 shrink-0"
              aria-label="Remove"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
