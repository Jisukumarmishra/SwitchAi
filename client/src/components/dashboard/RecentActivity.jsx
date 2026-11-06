import { formatRelativeTime } from '../../utils/formatters';
import { Bot, User, Info } from 'lucide-react';

const sourceConfig = {
  'Triage Agent': { icon: Bot, color: 'text-violet-400', bg: 'bg-violet-500/20' },
  'Investigation Agent': { icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
  'Fix & Release Agent': { icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  system: { icon: Info, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

export default function RecentActivity({ incidents = [] }) {
  const allEvents = incidents
    .flatMap((incident) =>
      (incident.timeline || []).map((ev) => ({
        ...ev,
        incidentTitle: incident.title,
        incidentId: incident.id,
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);

  if (allEvents.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h3>
        <p className="text-sm text-slate-500 text-center py-8">No activity yet. Run a workflow to see events here.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-slate-300 mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {allEvents.map((ev, idx) => {
          const config = sourceConfig[ev.actor] || sourceConfig.system;
          const Icon = config.icon;
          const text = ev.event || '';
          return (
            <div key={idx} className="flex items-start gap-3 group">
              <div className={`w-7 h-7 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon size={14} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300 leading-snug">
                  {text.length > 120 ? text.slice(0, 120) + '…' : text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-600">{ev.actor}</span>
                  <span className="text-xs text-slate-700">•</span>
                  <span className="text-xs text-slate-600">{formatRelativeTime(ev.timestamp)}</span>
                  {ev.incidentTitle && (
                    <>
                      <span className="text-xs text-slate-700">•</span>
                      <span className="text-xs text-slate-600 truncate">{ev.incidentTitle}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
