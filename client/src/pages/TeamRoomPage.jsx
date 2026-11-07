import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Bot,
  Check,
  CircleAlert,
  Hash,
  LoaderCircle,
  MessageSquareText,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { createIncident, getIncidents } from '../api/incidentApi';
import { formatRelativeTime } from '../utils/formatters';

const sampleReport = `Our GET /api/users/100 endpoint returns HTTP 500 when the user does not exist.\n\nExpected result: HTTP 404.\nService: users-api\nEnvironment: development`;

const agentStyles = {
  'Triage Agent': { initials: 'TR', color: 'text-violet-300', avatar: 'bg-violet-500/15 border-violet-400/20' },
  'Investigation Agent': { initials: 'IN', color: 'text-cyan-300', avatar: 'bg-cyan-500/15 border-cyan-400/20' },
  'Fix & Release Agent': { initials: 'RV', color: 'text-emerald-300', avatar: 'bg-emerald-500/15 border-emerald-400/20' },
};

function makeIncidentInput(report) {
  const lines = report.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const titleLine = lines.find((line) => !/^(bug report|bug|title)\s*:/i.test(line)) || lines[0] || 'Bug report';
  const title = titleLine.replace(/^#+\s*/, '').replace(/^(bug report|bug|title)\s*:\s*/i, '').slice(0, 120);
  const field = (name) => report.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, 'im'))?.[1]?.trim();
  const endpoint = report.match(/\/api\/([a-z0-9_-]+)/i)?.[1];
  const lower = report.toLowerCase();
  const severity = /critical|outage|unavailable|down/.test(lower)
    ? 'critical'
    : /http\s*5\d\d|\b500\b|high severity|urgent/.test(lower)
      ? 'high'
      : 'medium';
  const logs = report.split(/\r?\n/).filter((line) => /\b(error|exception|stack trace|fatal)\b/i.test(line));

  return {
    title,
    description: report,
    severity,
    affectedService: field('service') || (endpoint ? `${endpoint}-api` : 'sample-backend'),
    environment: field('environment') || 'development',
    logs,
  };
}

function getLiveMessage(event, index) {
  const agent = event.data?.agent;
  const actor = agent || 'SwitchAI';
  const messages = {
    workflow_started: 'The team picked up this bug report.',
    agent_started: `Started ${event.data?.phase || 'a'} review.`,
    agent_completed: event.data?.summary || 'Finished reviewing the report.',
    agent_error: `Could not complete this step: ${event.data?.error || 'unknown error'}`,
    workflow_completed: 'The agent run finished. Review the findings before taking action.',
  };
  return {
    id: `live-${event.timestamp || index}-${index}`,
    actor,
    content: messages[event.type] || event.data?.message || event.type.replaceAll('_', ' '),
    timestamp: event.timestamp || new Date().toISOString(),
    live: true,
  };
}

function getHistoryMessages(incidents) {
  return incidents.flatMap((incident) => {
    const report = {
      id: `${incident.id}-report`,
      incidentId: incident.id,
      actor: 'You',
      content: incident.description || incident.title,
      timestamp: incident.createdAt,
      isReport: true,
      incidentTitle: incident.title,
      status: incident.status,
    };
    const events = (incident.timeline || [])
      .filter((event) => event.event !== 'Incident reported')
      .map((event, index) => ({
        id: `${incident.id}-event-${index}`,
        incidentId: incident.id,
        actor: event.actor || 'SwitchAI',
        content: event.event,
        details: event.details,
        timestamp: event.timestamp,
        incidentTitle: incident.title,
        status: incident.status,
      }));
    return [report, ...events];
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

function Avatar({ actor }) {
  const style = agentStyles[actor];
  if (style) {
    return <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-[10px] font-bold ${style.avatar} ${style.color}`}>{style.initials}</div>;
  }
  if (actor === 'You') {
    return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-200"><UserRound size={16} /></div>;
  }
  return <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300"><Bot size={16} /></div>;
}

function ChatMessage({ message }) {
  const isUser = message.actor === 'You';
  const isAgent = Boolean(agentStyles[message.actor]);
  const style = agentStyles[message.actor];

  if (isUser) {
    return (
      <article className="flex justify-end gap-3">
        <div className="max-w-[min(82%,680px)]">
          <div className="mb-1.5 flex items-center justify-end gap-2 text-xs">
            <span className="text-slate-500">{formatRelativeTime(message.timestamp)}</span>
            <span className="font-medium text-blue-200">You</span>
          </div>
          <div className="rounded-2xl rounded-tr-md border border-blue-400/20 bg-blue-500/[0.09] px-4 py-3.5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-100">{message.content}</p>
            {message.isReport && <p className="mt-3 flex items-center gap-1.5 text-[11px] text-blue-200/70"><CircleAlert size={12} /> Bug report · {message.status?.replaceAll('_', ' ')}</p>}
          </div>
        </div>
        <Avatar actor={message.actor} />
      </article>
    );
  }

  const isSystem = !isAgent;
  return (
    <article className={`flex items-start gap-3 ${message.live ? 'animate-pulse' : ''}`}>
      <Avatar actor={message.actor} />
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className={`font-semibold ${style?.color || 'text-slate-300'}`}>{message.actor}</span>
          {isAgent && <span className="rounded-full border border-slate-700/80 px-2 py-0.5 text-[10px] text-slate-500">{message.actor === 'Triage Agent' ? 'TRIAGE' : message.actor === 'Investigation Agent' ? 'INVESTIGATION' : 'REVIEW'}</span>}
          {message.live && <span className="flex items-center gap-1 text-blue-300"><LoaderCircle className="animate-spin" size={11} /> working</span>}
          {message.incidentTitle && <span className="truncate text-slate-600">· {message.incidentTitle}</span>}
          <span className="ml-auto text-slate-600">{formatRelativeTime(message.timestamp)}</span>
        </div>
        <div className={`rounded-2xl rounded-tl-md border px-4 py-3 ${isSystem ? 'border-slate-800 bg-slate-900/60' : 'border-slate-800/80 bg-slate-900/80'}`}>
          <p className="text-sm leading-6 text-slate-200">{message.content}</p>
          {message.details && <p className="mt-2 border-t border-slate-800 pt-2 text-xs leading-5 text-slate-400">{message.details}</p>}
          {message.status === 'awaiting_approval' && message.actor === 'system' && /awaiting human review/i.test(message.content) && (
            <Link to={`/incidents/${message.incidentId}`} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-amber-200">
              Review this demo run <ArrowUpRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TeamRoomPage() {
  const [incidents, setIncidents] = useState(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [liveEvents, setLiveEvents] = useState([]);
  const [error, setError] = useState('');
  const historyRef = useRef(null);

  async function refreshIncidents() {
    const result = await getIncidents();
    const next = result.data || [];
    setIncidents(next);
    return next;
  }

  useEffect(() => {
    let active = true;
    getIncidents()
      .then((result) => {
        if (active) setIncidents(result.data || []);
      })
      .catch((loadError) => {
        if (!active) return;
        setError(loadError.message || 'Could not connect to the local demo server.');
        setIncidents([]);
      });
    return () => { active = false; };
  }, []);

  const loading = incidents === null;
  const messages = useMemo(() => {
    const history = getHistoryMessages(incidents || []);
    const live = liveEvents.map(getLiveMessage);
    return [...history, ...live].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [incidents, liveEvents]);

  useEffect(() => {
    if (historyRef.current) historyRef.current.scrollTop = historyRef.current.scrollHeight;
  }, [messages.length]);

  async function runWorkflow(incidentId) {
    setSending(true);
    setLiveEvents([]);
    try {
      const response = await fetch(`/api/incidents/${incidentId}/run-workflow`, { method: 'POST' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Workflow request failed (${response.status}).`);
      }
      if (!response.body) throw new Error('The server did not start the live workflow stream.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let streamError = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'workflow_finished') continue;
            if (event.type === 'workflow_error') {
              streamError = event.data?.error || 'The agent workflow failed.';
              continue;
            }
            setLiveEvents((previous) => [...previous, event]);
          } catch {
            // Ignore incomplete or malformed SSE frames and keep reading the stream.
          }
        }
      }
      await refreshIncidents();
      setLiveEvents([]);
      if (streamError) setError(streamError);
    } catch (workflowError) {
      setError(workflowError.message || 'The agent workflow could not be started.');
      await refreshIncidents().catch(() => {});
    } finally {
      setSending(false);
    }
  }

  async function handleSend(event) {
    event.preventDefault();
    const report = input.trim();
    if (!report || sending) return;
    setError('');
    setSending(true);
    setInput('');
    try {
      const result = await createIncident(makeIncidentInput(report));
      const incident = result.data;
      setIncidents((previous) => [...previous, incident]);
      await runWorkflow(incident.id);
    } catch (sendError) {
      setInput(report);
      setError(sendError.message || 'Your bug report could not be sent.');
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] min-h-[34rem] max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#080d18] shadow-2xl shadow-black/20">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300"><Hash size={19} /></div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-100">devflow-team</h1>
            <p className="mt-0.5 text-xs text-slate-500">Bug reports and agent collaboration</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-[11px] text-slate-400">Local demo · 3 agents</span>
        </div>
      </header>

      <div ref={historyRef} className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-7">
        <div className="mx-auto max-w-2xl rounded-xl border border-blue-400/10 bg-blue-500/[0.035] px-4 py-3 text-center">
          <p className="flex items-center justify-center gap-2 text-xs font-medium text-blue-200"><Sparkles size={14} /> SwitchAI team room</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Post a bug report to start the local triage, investigation, and remediation demo. Reports and agent events stay in this server session’s incident history.</p>
        </div>

        {loading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={16} /> Loading chat history…</div>}

        {!loading && messages.length === 0 && (
          <div className="mx-auto max-w-lg py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-400"><MessageSquareText size={20} /></div>
            <h2 className="mt-4 text-sm font-semibold text-slate-200">Start the conversation</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">Send a bug report here. The local agent demo will add each step to this chat history.</p>
            <button type="button" onClick={() => setInput(sampleReport)} className="mt-4 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 transition hover:border-blue-400/40 hover:text-blue-200">Insert sample user API bug</button>
          </div>
        )}

        {messages.map((message) => <ChatMessage key={message.id} message={message} />)}

        {sending && liveEvents.length === 0 && (
          <div className="flex items-center gap-3 text-xs text-slate-500"><div className="h-px flex-1 bg-slate-800" /><span className="flex items-center gap-1.5"><LoaderCircle className="animate-spin" size={12} /> Starting agent team</span><div className="h-px flex-1 bg-slate-800" /></div>
        )}
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-950/70 p-3 sm:p-4">
        {error && <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-rose-400/20 bg-rose-500/[0.06] px-3 py-2 text-xs text-rose-200"><CircleAlert size={14} className="mt-0.5 shrink-0" />{error}</div>}
        <form onSubmit={handleSend} className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-2 transition focus-within:border-blue-400/40 focus-within:ring-2 focus-within:ring-blue-400/10">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }}
              placeholder="Describe a bug or paste an error log…"
              aria-label="Bug report message"
              rows={3}
              disabled={sending}
              className="max-h-40 min-h-[4.5rem] w-full resize-y bg-transparent px-2 py-1.5 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3 border-t border-slate-800 px-1 pt-2">
              <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-slate-500"><Check size={12} className="shrink-0 text-emerald-400" /><span className="truncate">Agent actions are simulated in local demo mode</span></div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" disabled={sending} onClick={() => setInput(sampleReport)} className="hidden rounded-md px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 disabled:opacity-50 sm:block">Use sample</button>
                <button type="submit" disabled={!input.trim() || sending} className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40">
                  {sending ? <LoaderCircle className="animate-spin" size={14} /> : <Send size={14} />}
                  <span>{sending ? 'Agents working' : 'Send report'}</span>
                </button>
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-600">Enter to send · Shift + Enter for a new line</p>
        </form>
      </div>
    </div>
  );
}
