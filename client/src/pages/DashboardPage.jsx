import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents, createIncident } from '../api/incidentApi';
import StatsGrid from '../components/dashboard/StatsGrid';
import RecentActivity from '../components/dashboard/RecentActivity';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Play, Plus } from 'lucide-react';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadIncidents();
  }, []);

  async function loadIncidents() {
    try {
      const res = await getIncidents();
      setIncidents(res.data || []);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunDemo() {
    setCreating(true);
    try {
      const res = await createIncident({
        title: 'Checkout API returning HTTP 500 errors',
        description:
          'The checkout service started returning HTTP 500 errors shortly after deployment v2.14.0. Error rate increased from 0.1% to 23% within 15 minutes.',
        severity: 'critical',
        affectedService: 'checkout-service',
        environment: 'production',
      });
      navigate(`/incidents/${res.data.id}`);
    } catch (err) {
      console.error('Failed to create demo incident:', err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered DevOps incident response overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={handleRunDemo} loading={creating}>
            <Play size={16} />
            Run Demo Workflow
          </Button>
        </div>
      </div>

      <StatsGrid incidents={incidents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity incidents={incidents} />
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/incidents')}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <Plus size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Create Incident</p>
                <p className="text-xs text-slate-500">Report a new production incident</p>
              </div>
            </button>
            <button
              onClick={handleRunDemo}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                <Play size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">Run AI Incident Workflow</p>
                <p className="text-xs text-slate-500">Create a demo incident and run the full AI pipeline</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
