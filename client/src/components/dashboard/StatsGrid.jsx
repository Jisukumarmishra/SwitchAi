import { AlertTriangle, AlertCircle, CheckCircle2, Bot, Clock, FolderOpen } from 'lucide-react';

const statIcons = {
  total: FolderOpen,
  open: AlertCircle,
  critical: AlertTriangle,
  resolved: CheckCircle2,
  agents: Bot,
  pending: Clock,
};

const statColors = {
  total: 'from-blue-600 to-blue-700',
  open: 'from-amber-600 to-amber-700',
  critical: 'from-red-600 to-red-700',
  resolved: 'from-emerald-600 to-emerald-700',
  agents: 'from-violet-600 to-violet-700',
  pending: 'from-orange-600 to-orange-700',
};

export default function StatsGrid({ incidents = [] }) {
  const total = incidents.length;
  const open = incidents.filter((i) => i.status === 'open' || i.status === 'investigating' || i.status === 'triaging' || i.status === 'fixing').length;
  const critical = incidents.filter((i) => i.severity === 'critical').length;
  const resolved = incidents.filter((i) => i.status === 'resolved').length;
  const pending = incidents.filter((i) => i.status === 'awaiting_approval').length;

  const stats = [
    { key: 'total', label: 'Total Incidents', value: total },
    { key: 'open', label: 'Open Incidents', value: open },
    { key: 'critical', label: 'Critical', value: critical },
    { key: 'resolved', label: 'Resolved', value: resolved },
    { key: 'agents', label: 'Active AI Agents', value: 3 },
    { key: 'pending', label: 'Pending Approval', value: pending },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat) => {
        const Icon = statIcons[stat.key];
        return (
          <div
            key={stat.key}
            className="bg-slate-900 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${statColors[stat.key]} flex items-center justify-center`}>
                <Icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
