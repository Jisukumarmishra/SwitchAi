const severityConfig = {
  critical: { label: 'Critical', classes: 'bg-red-600/20 text-red-400 border-red-600/30' },
  high: { label: 'High', classes: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  medium: { label: 'Medium', classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  low: { label: 'Low', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function SeverityBadge({ severity }) {
  const config = severityConfig[severity] || { label: severity || 'Unknown', classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
}
