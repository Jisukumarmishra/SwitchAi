import { useState, useEffect } from 'react';
import { getAgents } from '../api/agentApi';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Shield, Search, Wrench, CheckCircle } from 'lucide-react';

const agentIcons = {
  'Triage Agent': Shield,
  'Investigation Agent': Search,
  'Fix & Release Agent': Wrench,
};

const agentThemes = {
  'Triage Agent': { gradient: 'from-violet-600 to-violet-700', border: 'border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/10' },
  'Investigation Agent': { gradient: 'from-cyan-600 to-cyan-700', border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  'Fix & Release Agent': { gradient: 'from-emerald-600 to-emerald-700', border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgents().then((res) => setAgents(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">AI Agents</h1>
        <p className="text-sm text-slate-500 mt-1">Specialized agents powering incident response</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const Icon = agentIcons[agent.name] || Shield;
          const theme = agentThemes[agent.name] || agentThemes['Triage Agent'];
          return (
            <Card key={agent.name} className={theme.border}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center`}>
                  <Icon size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{agent.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <CheckCircle size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400">Online</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">{agent.role}</p>
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs font-medium text-slate-500 mb-2">Responsibilities</p>
                <ul className="space-y-1.5">
                  {(agent.responsibilities || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className={`w-1 h-1 rounded-full ${theme.text} mt-1.5 flex-shrink-0`} style={{ backgroundColor: 'currentColor' }} />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
