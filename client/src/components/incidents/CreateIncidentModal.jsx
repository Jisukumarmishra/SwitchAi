import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const initialForm = {
  title: '',
  description: '',
  severity: 'high',
  affectedService: '',
  environment: 'production',
  logs: '',
};

export default function CreateIncidentModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setLoading(true);
    try {
      await onCreate(form);
      setForm(initialForm);
      onClose();
    } catch (err) {
      console.error('Failed to create incident:', err);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Incident" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Brief description of the incident"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Detailed description of what happened..."
            rows={3}
            className={inputClass}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Severity *</label>
            <select name="severity" value={form.severity} onChange={handleChange} className={inputClass}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Environment</label>
            <select name="environment" value={form.environment} onChange={handleChange} className={inputClass}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Affected Service</label>
          <input
            name="affectedService"
            value={form.affectedService}
            onChange={handleChange}
            placeholder="e.g., payment-service, auth-api"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Logs (optional)</label>
          <textarea
            name="logs"
            value={form.logs}
            onChange={handleChange}
            placeholder="Paste relevant log output..."
            rows={3}
            className={`${inputClass} font-mono text-xs`}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!form.title.trim() || !form.description.trim()}>
            Create Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
}
