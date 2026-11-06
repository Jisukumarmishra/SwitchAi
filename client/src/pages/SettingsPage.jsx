import { useState, useEffect } from 'react';
import { getIntegrationStatus, getHealth } from '../api/integrationApi';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plug, Bot, Database, FlaskConical, CheckCircle, AlertCircle, Info } from 'lucide-react';

function StatusIndicator({ status }) {
  const configs = {
    connected: { icon: CheckCircle, color: 'text-emerald-400', label: 'Connected' },
    configured: { icon: CheckCircle, color: 'text-emerald-400', label: 'Configured' },
    demo_mode: { icon: FlaskConical, color: 'text-amber-400', label: 'Demo Mode' },
    in_memory: { icon: Info, color: 'text-amber-400', label: 'In-Memory (Demo)' },
    not_configured: { icon: AlertCircle, color: 'text-orange-400', label: 'Not Configured' },
  };
  const c = configs[status] || configs.not_configured;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${c.color}`}>
      <Icon size={14} /> {c.label}
    </span>
  );
}

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getIntegrationStatus().then((r) => setIntegrations(r.data)).catch(console.error),
      getHealth().then((r) => setHealth(r)).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings & Integrations</h1>
        <p className="text-sm text-slate-500 mt-1">Configure external integrations and view system status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Switch */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Plug size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Switch Integration</h3>
                <p className="text-xs text-slate-500">Collaboration platform</p>
              </div>
            </div>
            <StatusIndicator status={integrations?.switch?.status} />
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {integrations?.switch?.enabled
              ? 'Switch is enabled. Agent messages will be sent to your configured Switch room.'
              : 'Switch is not configured. Using local demo adapter. Enable by setting SWITCH_ENABLED=true in .env and providing Switch credentials.'}
          </p>
          <p className="text-xs text-slate-600">Mode: {integrations?.switch?.mode || 'N/A'}</p>
        </Card>

        {/* AI Provider */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">AI Provider</h3>
                <p className="text-xs text-slate-500">LLM for agent analysis</p>
              </div>
            </div>
            <StatusIndicator status={integrations?.ai?.status} />
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {integrations?.ai?.provider === 'mock'
              ? 'Using built-in mock AI provider with realistic demo responses. No API key required.'
              : `Connected to ${integrations?.ai?.provider} provider.`}
          </p>
          <p className="text-xs text-slate-600">Provider: {integrations?.ai?.provider || 'N/A'}</p>
        </Card>

        {/* Database */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                <Database size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Database</h3>
                <p className="text-xs text-slate-500">Data storage layer</p>
              </div>
            </div>
            <StatusIndicator status={integrations?.database?.status} />
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {integrations?.database?.mode === 'memory'
              ? 'Using in-memory storage for demo. Data resets on server restart. Set DATA_MODE=mongodb for persistence.'
              : 'Connected to MongoDB instance.'}
          </p>
          <p className="text-xs text-slate-600">Mode: {integrations?.database?.mode || 'N/A'}</p>
        </Card>

        {/* Demo Mode */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                <FlaskConical size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100">Demo Mode</h3>
                <p className="text-xs text-slate-500">Sample data & mock AI</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${integrations?.demo?.enabled ? 'text-amber-400' : 'text-slate-400'}`}>
              {integrations?.demo?.enabled ? '● Enabled' : '○ Disabled'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {integrations?.demo?.enabled
              ? 'Demo mode is active. A sample incident is seeded on startup. All AI responses use realistic mock data.'
              : 'Demo mode is disabled. The application will use configured AI providers and database.'}
          </p>
        </Card>
      </div>

      {/* Server Info */}
      {health && (
        <Card>
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Server Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div><span className="text-slate-500">Status</span><p className="text-emerald-400 font-medium mt-0.5">{health.status}</p></div>
            <div><span className="text-slate-500">Uptime</span><p className="text-slate-300 mt-0.5">{Math.floor(health.uptime || 0)}s</p></div>
            <div><span className="text-slate-500">Data Mode</span><p className="text-slate-300 mt-0.5">{health.dataMode}</p></div>
            <div><span className="text-slate-500">Switch</span><p className="text-slate-300 mt-0.5">{health.switchEnabled ? 'Enabled' : 'Disabled'}</p></div>
          </div>
        </Card>
      )}
    </div>
  );
}
