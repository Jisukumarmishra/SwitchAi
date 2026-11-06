const statusConfig = {
  open: { label: 'Open', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  investigating: { label: 'Investigating', classes: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  triaging: { label: 'Triaging', classes: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  fixing: { label: 'Fixing', classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  awaiting_approval: { label: 'Awaiting Approval', classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  resolved: { label: 'Resolved', classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  rejected: { label: 'Rejected', classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  closed: { label: 'Closed', classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status || 'Unknown', classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {config.label}
    </span>
  );
}
