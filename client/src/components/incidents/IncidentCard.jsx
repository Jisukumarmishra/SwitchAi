import { useNavigate } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import SeverityBadge from '../common/SeverityBadge';
import { formatRelativeTime } from '../../utils/formatters';
import { Clock, Server, GitBranch } from 'lucide-react';

export default function IncidentCard({ incident }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/incidents/${incident.id}`)}
      className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-slate-600 hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors leading-snug">
          {incident.title}
        </h3>
        <SeverityBadge severity={incident.severity} />
      </div>

      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
        {incident.description || 'No description'}
      </p>

      <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
        {incident.affectedService && (
          <span className="inline-flex items-center gap-1">
            <Server size={12} /> {incident.affectedService}
          </span>
        )}
        {incident.environment && (
          <span className="inline-flex items-center gap-1">
            <GitBranch size={12} /> {incident.environment}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <StatusBadge status={incident.status} />
        <span className="text-xs text-slate-600 inline-flex items-center gap-1">
          <Clock size={12} />
          {formatRelativeTime(incident.createdAt)}
        </span>
      </div>
    </div>
  );
}
