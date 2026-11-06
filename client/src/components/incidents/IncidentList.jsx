import IncidentCard from './IncidentCard';
import EmptyState from '../common/EmptyState';
import { AlertTriangle } from 'lucide-react';

export default function IncidentList({ incidents = [] }) {
  if (incidents.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="No incidents found"
        description="No incidents match your filters. Create a new incident or adjust your search."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <IncidentCard key={incident.id} incident={incident} />
      ))}
    </div>
  );
}
