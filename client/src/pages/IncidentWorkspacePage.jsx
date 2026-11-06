import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getIncident, approveIncident, rejectIncident } from '../api/incidentApi';
import StatusBadge from '../components/common/StatusBadge';
import SeverityBadge from '../components/common/SeverityBadge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import {
  Play, CheckCircle2, XCircle, Search, Bot, User, Info, Server,
  GitBranch, Clock, Shield, AlertTriangle, Wrench, FileText
} from 'lucide-react';

const agentColors = {
  'Triage Agent': { border: 'border-violet-500/30', bg: 'bg-violet-500/10', text: 'text-violet-400', icon: 'bg-violet-500/20' },
  'Investigation Agent': { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400', icon: 'bg-cyan-500/20' },
  'Fix & Release Agent': { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'bg-emerald-500/20' },
};

function getActorStyle(actor) {
  if (agentColors[actor]) return agentColors[actor];
  if (actor === 'system') return { border: 'border-slate-600/30', bg: 'bg-slate-500/10', text: 'text-slate-400', icon: 'bg-slate-500/20' };
  return { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', icon: 'bg-blue-500/20' };
}

export default function IncidentWorkspacePage() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [approverName, setApproverName] = useState('');
  const [comments, setComments] = useState('');
  const [liveEvents, setLiveEvents] = useState([]);
  const timelineRef = useRef(null);

  useEffect(() => { loadIncident(); }, [id]);
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [incident?.timeline, liveEvents]);

  async function loadIncident() {
    try {
      const res = await getIncident(id);
      setIncident(res.data);
    } catch (err) {
      console.error('Failed to load incident:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleRunWorkflow() {
    setRunning(true);
    setLiveEvents([]);
    const url = `/api/incidents/${id}/run-workflow`;
    fetch(url, { method: 'POST' }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              setLiveEvents((prev) => [...prev, event]);
              if (event.type === 'workflow_finished' && event.data?.incident) {
                setIncident(event.data.incident);
              }
            } catch {}
          }
        }
      }
      setRunning(false);
      loadIncident();
    }).catch(() => setRunning(false));
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await approveIncident(id, { approvedBy: approverName || 'Engineer', comments });
      setIncident(res.data);
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    setRejecting(true);
    try {
      const res = await rejectIncident(id, { rejectedBy: approverName || 'Engineer', reason: comments });
      setIncident(res.data);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setRejecting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!incident) return <div className="text-slate-400 text-center py-12">Incident not found</div>;

  const canRun = ['reported', 'rejected'].includes(incident.status);
  const needsApproval = incident.status === 'awaiting_approval';
  const isResolved = incident.status === 'resolved';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{incident.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{incident.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canRun && (
            <Button onClick={handleRunWorkflow} loading={running}>
              <Play size={16} /> Run AI Incident Workflow
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Details + Agent Findings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Incident Info */}
          <Card>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Incident Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusBadge status={incident.status} /></div>
              <div className="flex justify-between"><span className="text-slate-500">Severity</span><SeverityBadge severity={incident.severity} /></div>
              <div className="flex justify-between"><span className="text-slate-500">Service</span><span className="text-slate-300 flex items-center gap-1"><Server size={14} />{incident.affectedService || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Environment</span><span className="text-slate-300 flex items-center gap-1"><GitBranch size={14} />{incident.environment}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Created</span><span className="text-slate-300 flex items-center gap-1"><Clock size={14} />{formatDate(incident.createdAt)}</span></div>
            </div>
          </Card>

          {/* Agent Findings */}
          {incident.agentFindings?.triage && (
            <Card className="border-violet-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center"><Shield size={14} className="text-violet-400" /></div>
                <h3 className="text-sm font-semibold text-violet-400">Triage Agent</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Classification:</span> <span className="text-slate-300">{incident.agentFindings.triage.classification?.type} ({incident.agentFindings.triage.classification?.subtype})</span></div>
                <div><span className="text-slate-500">Confidence:</span> <span className="text-slate-300">{(incident.agentFindings.triage.classification?.confidence * 100).toFixed(0)}%</span></div>
                <div><span className="text-slate-500">Priority:</span> <span className="text-slate-300">{incident.agentFindings.triage.priority?.level}</span></div>
                <div><span className="text-slate-500">Severity:</span> <span className="text-slate-300">{incident.agentFindings.triage.severityAssessment?.recommended} (impact: {incident.agentFindings.triage.severityAssessment?.impactScore}/10)</span></div>
                {incident.agentFindings.triage.recommendations && (
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <p className="text-slate-500 mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                      {incident.agentFindings.triage.recommendations.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {incident.agentFindings?.investigation && (
            <Card className="border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center"><Search size={14} className="text-cyan-400" /></div>
                <h3 className="text-sm font-semibold text-cyan-400">Investigation Agent</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Logs analyzed:</span> <span className="text-slate-300">{incident.agentFindings.investigation.logAnalysis?.totalEntriesAnalyzed?.toLocaleString()}</span></div>
                <div><span className="text-slate-500">Errors found:</span> <span className="text-slate-300">{incident.agentFindings.investigation.logAnalysis?.errorCount?.toLocaleString()}</span></div>
                <div><span className="text-slate-500">Correlation:</span> <span className="text-slate-300">{incident.agentFindings.investigation.deploymentCorrelation?.correlationStrength}</span></div>
                {incident.agentFindings.investigation.rootCauses?.map((rc, i) => (
                  <div key={i} className="mt-2 pt-2 border-t border-slate-700">
                    <p className="text-slate-400"><span className="text-cyan-400 font-medium">{rc.id}</span> (confidence: {(rc.confidence * 100).toFixed(0)}%)</p>
                    <p className="text-slate-500 mt-1">{rc.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {incident.agentFindings?.fix && (
            <Card className="border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Wrench size={14} className="text-emerald-400" /></div>
                <h3 className="text-sm font-semibold text-emerald-400">Fix & Release Agent</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Risk level:</span> <span className="text-slate-300">{incident.agentFindings.fix.riskAssessment?.level}</span></div>
                <div><span className="text-slate-500">Recovery time:</span> <span className="text-slate-300">{incident.agentFindings.fix.estimatedRecoveryTime}</span></div>
                <div><span className="text-slate-500">Recommendation:</span> <span className="text-slate-300">{incident.agentFindings.fix.recommendation}</span></div>
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <p className="text-slate-500 mb-1">Remediation steps:</p>
                  <ol className="list-decimal list-inside text-slate-400 space-y-0.5">
                    {incident.agentFindings.fix.remediationPlan?.steps?.map((s, i) => (
                      <li key={i}>{s.action} <span className="text-slate-600">({s.estimatedMinutes}min)</span></li>
                    ))}
                  </ol>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right — Timeline + Approval */}
        <div className="lg:col-span-3 space-y-4">
          {/* Approval Controls */}
          {needsApproval && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400">Human Approval Required</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Review the AI agents' findings and remediation plan, then approve or reject.</p>
              <div className="space-y-3 mb-4">
                <input
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Comments (optional)"
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="success" onClick={handleApprove} loading={approving}>
                  <CheckCircle2 size={16} /> Approve
                </Button>
                <Button variant="danger" onClick={handleReject} loading={rejecting}>
                  <XCircle size={16} /> Reject
                </Button>
              </div>
            </Card>
          )}

          {/* Resolution */}
          {isResolved && incident.resolution?.summary && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <h3 className="text-sm font-semibold text-emerald-400">Incident Resolved</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div><span className="text-slate-500">Summary:</span> <span className="text-slate-300">{incident.resolution.summary}</span></div>
                <div><span className="text-slate-500">Action:</span> <span className="text-slate-300">{incident.resolution.actionTaken}</span></div>
                <div><span className="text-slate-500">Resolved by:</span> <span className="text-slate-300">{incident.resolution.resolvedBy}</span></div>
                <div><span className="text-slate-500">Resolved at:</span> <span className="text-slate-300">{formatDate(incident.resolution.resolvedAt)}</span></div>
              </div>
            </Card>
          )}

          {/* Activity Timeline */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <FileText size={16} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-300">Activity Timeline</h3>
              {running && <span className="text-xs text-blue-400 animate-pulse ml-auto">● Live</span>}
            </div>
            <div ref={timelineRef} className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {(incident.timeline || []).map((event, idx) => {
                const style = getActorStyle(event.actor);
                return (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${style.border} ${style.bg}`}>
                    <div className={`w-7 h-7 rounded-full ${style.icon} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {event.actor && agentColors[event.actor] ? <Bot size={14} className={style.text} /> : event.actor === 'system' ? <Info size={14} className={style.text} /> : <User size={14} className={style.text} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${style.text}`}>{event.actor || 'System'}</span>
                        <span className="text-xs text-slate-600">{formatDate(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-slate-300">{event.event}</p>
                      {event.details && <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{event.details}</p>}
                    </div>
                  </div>
                );
              })}
              {liveEvents.filter(e => e.type !== 'workflow_finished').map((event, idx) => (
                <div key={`live-${idx}`} className="flex items-start gap-3 p-3 rounded-lg border border-blue-500/20 bg-blue-500/5 animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-blue-400">{event.data?.agent || 'System'}</span>
                    <p className="text-sm text-slate-300">{event.data?.message || event.data?.summary || event.type}</p>
                  </div>
                </div>
              ))}
              {(incident.timeline || []).length === 0 && liveEvents.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No activity yet. Click "Run AI Incident Workflow" to start.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
