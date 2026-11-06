import { useState, useEffect } from 'react';
import { getIncidents } from '../api/incidentApi';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Bot, User, Info, Send } from 'lucide-react';

const sourceStyle = {
  'Triage Agent': { color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/20' },
  'Investigation Agent': { color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/20' },
  'Fix & Release Agent': { color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' },
  system: { color: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-700' },
};

export default function TeamRoomPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localMessages, setLocalMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    getIncidents().then((res) => setIncidents(res.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const allMessages = [
    ...incidents.flatMap((inc) =>
      (inc.timeline || []).map((e) => ({
        actor: e.actor || 'system',
        event: e.event,
        details: e.details,
        timestamp: e.timestamp,
        incidentTitle: inc.title,
      }))
    ),
    ...localMessages,
  ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      { actor: 'You', event: input, timestamp: new Date().toISOString(), isHuman: true },
    ]);
    setInput('');
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-100">Team Room</h1>
        <p className="text-sm text-slate-500 mt-1">Collaboration between humans and AI agents</p>
      </div>

      <div className="flex-1 bg-slate-900 border border-slate-700 rounded-xl flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {allMessages.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-12">No messages yet. Run a workflow to see agent collaboration here.</p>
          )}
          {allMessages.map((msg, idx) => {
            const style = sourceStyle[msg.actor] || (msg.isHuman ? { color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' } : sourceStyle.system);
            const isAgent = ['Triage Agent', 'Investigation Agent', 'Fix & Release Agent'].includes(msg.actor);
            return (
              <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${style.border} bg-slate-800/30`}>
                <div className={`w-7 h-7 rounded-full ${style.bg} flex items-center justify-center flex-shrink-0`}>
                  {isAgent ? <Bot size={14} className={style.color} /> : msg.isHuman ? <User size={14} className={style.color} /> : <Info size={14} className={style.color} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold ${style.color}`}>{msg.actor}</span>
                    {msg.incidentTitle && <span className="text-xs text-slate-600">• {msg.incidentTitle}</span>}
                    <span className="text-xs text-slate-600 ml-auto">{formatDate(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm text-slate-300">{msg.event}</p>
                  {msg.details && <p className="text-xs text-slate-500 mt-1">{msg.details}</p>}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-700 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
