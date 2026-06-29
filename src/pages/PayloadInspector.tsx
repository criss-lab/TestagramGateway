import { useState } from 'react';
import { Code2, RefreshCw, Copy, CheckCheck, Search, ChevronDown, ChevronRight, AlertCircle, Wifi, Globe } from 'lucide-react';
import { useDeliveryQueue } from '@/hooks/useDeliveryQueue';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { timeAgo, cn } from '@/lib/utils';
import StatusBadge from '@/components/features/StatusBadge';
import { toast } from 'sonner';
import type { WebFingerResult } from '@/types/federation';

const AP_TEMPLATES: Record<string, object> = {
  'Note (Create)': {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Create',
    id: 'https://testagram.site/activities/create/001',
    actor: 'https://testagram.site/users/alice',
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: ['https://testagram.site/users/alice/followers'],
    object: {
      type: 'Note',
      id: 'https://testagram.site/posts/001',
      attributedTo: 'https://testagram.site/users/alice',
      content: '<p>Hello Fediverse! This is a test post from Testagram.</p>',
      published: new Date().toISOString(),
      to: ['https://www.w3.org/ns/activitystreams#Public'],
    },
  },
  'Follow': {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Follow',
    id: 'https://testagram.site/activities/follow/001',
    actor: 'https://testagram.site/users/alice',
    object: 'https://mastodon.social/users/bob',
  },
  'Like': {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Like',
    id: 'https://testagram.site/activities/like/001',
    actor: 'https://testagram.site/users/alice',
    object: 'https://mastodon.social/users/bob/statuses/001',
  },
  'Announce (Boost)': {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'Announce',
    id: 'https://testagram.site/activities/announce/001',
    actor: 'https://testagram.site/users/alice',
    object: 'https://mastodon.social/users/bob/statuses/001',
    to: ['https://www.w3.org/ns/activitystreams#Public'],
    cc: ['https://testagram.site/users/alice/followers'],
  },
  'Person (Actor)': {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
    type: 'Person',
    id: 'https://testagram.site/users/alice',
    following: 'https://testagram.site/users/alice/following',
    followers: 'https://testagram.site/users/alice/followers',
    inbox: 'https://testagram.site/users/alice/inbox',
    outbox: 'https://testagram.site/users/alice/outbox',
    preferredUsername: 'alice',
    name: 'Alice',
    summary: '<p>Test user on Testagram</p>',
    url: 'https://testagram.site/@alice',
    publicKey: {
      id: 'https://testagram.site/users/alice#main-key',
      owner: 'https://testagram.site/users/alice',
      publicKeyPem: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
    },
  },
  'WebFinger Response': {
    subject: 'acct:alice@testagram.site',
    links: [{ rel: 'self', type: 'application/activity+json', href: 'https://testagram.site/users/alice' }],
  },
};

function JsonNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  if (data === null) return <span className="text-muted-foreground">null</span>;
  if (typeof data === 'boolean') return <span className="text-amber-400">{String(data)}</span>;
  if (typeof data === 'number') return <span className="text-cyan-400">{data}</span>;
  if (typeof data === 'string') return <span className="text-emerald-400">"{data}"</span>;
  if (Array.isArray(data)) {
    if (!data.length) return <span className="text-muted-foreground">[]</span>;
    return <span>
      <button onClick={() => setCollapsed(p => !p)} className="text-amber-300 hover:text-amber-200 transition-colors">
        {collapsed ? <ChevronRight className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}[{data.length}]
      </button>
      {!collapsed && <div className="ml-4 border-l border-border/40 pl-2">
        {data.map((item, i) => <div key={i}><JsonNode data={item} depth={depth + 1} />{i < data.length - 1 && <span className="text-muted-foreground">,</span>}</div>)}
      </div>}
    </span>;
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data as object);
    if (!keys.length) return <span className="text-muted-foreground">{'{}'}</span>;
    return <span>
      <button onClick={() => setCollapsed(p => !p)} className="text-amber-300 hover:text-amber-200 transition-colors">
        {collapsed ? <ChevronRight className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />}{'{'}…{'}'}
      </button>
      {!collapsed && <div className="ml-4 border-l border-border/40 pl-2">
        {keys.map((key, i) => <div key={key} className="leading-6">
          <span className="text-violet-400">"{key}"</span><span className="text-muted-foreground">: </span>
          <JsonNode data={(data as Record<string, unknown>)[key]} depth={depth + 1} />
          {i < keys.length - 1 && <span className="text-muted-foreground">,</span>}
        </div>)}
      </div>}
    </span>;
  }
  return <span className="text-foreground">{String(data)}</span>;
}

type Mode = 'queue' | 'builder' | 'webfinger';

export default function PayloadInspector() {
  const [mode, setMode] = useState<Mode>('queue');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Note (Create)');
  const [customJson, setCustomJson] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // WebFinger state
  const [wfHandle, setWfHandle] = useState('');
  const [wfLoading, setWfLoading] = useState(false);
  const [wfResult, setWfResult] = useState<WebFingerResult | null>(null);
  const [wfActorResult, setWfActorResult] = useState<unknown>(null);
  const [wfError, setWfError] = useState<string | null>(null);

  const { data: items, isLoading } = useDeliveryQueue('all');
  const { data: logs } = useActivityLogs(50);

  const filteredItems = (items ?? []).filter(item => {
    const q = search.toLowerCase();
    return !q || item.activity_type.toLowerCase().includes(q) || (item.target_domain ?? '').toLowerCase().includes(q);
  });

  const selectedItem = items?.find(i => i.id === selectedId);
  const templatePayload = AP_TEMPLATES[selectedTemplate] ?? {};
  let parsedCustom: unknown = null;
  try { parsedCustom = customJson ? JSON.parse(customJson) : templatePayload; } catch { parsedCustom = templatePayload; }

  function handleCopy(obj: unknown) {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopied(true);
    toast.success('Payload copied.');
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCustomChange(val: string) {
    setCustomJson(val);
    try { JSON.parse(val); setJsonError(null); } catch (e: any) { setJsonError(e.message); }
  }

  async function handleWebFinger(e: React.FormEvent) {
    e.preventDefault();
    if (!wfHandle.trim()) return;
    setWfLoading(true);
    setWfResult(null);
    setWfActorResult(null);
    setWfError(null);

    const raw = wfHandle.trim().replace(/^@/, '');
    const parts = raw.split('@');
    if (parts.length !== 2) {
      setWfError('Use format: user@domain or @user@domain');
      setWfLoading(false);
      return;
    }
    const [user, domain] = parts;

    try {
      const wfUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://${domain}/.well-known/webfinger?resource=acct:${user}@${domain}`)}`;
      const res = await fetch(wfUrl, { headers: { Accept: 'application/jrd+json,application/json' } });
      if (!res.ok) throw new Error(`WebFinger returned HTTP ${res.status}`);
      const data: WebFingerResult = await res.json();
      setWfResult(data);

      // Try to fetch actor JSON
      const actorLink = data.links?.find(l => l.type === 'application/activity+json' || l.rel === 'self');
      if (actorLink?.href) {
        const actorUrl = `https://corsproxy.io/?url=${encodeURIComponent(actorLink.href)}`;
        const actorRes = await fetch(actorUrl, { headers: { Accept: 'application/activity+json,application/ld+json' } });
        if (actorRes.ok) setWfActorResult(await actorRes.json());
      }
    } catch (err: any) {
      setWfError(`Failed to resolve WebFinger: ${err.message}. (CORS proxy may be needed for some instances)`);
    }
    setWfLoading(false);
  }

  return (
    <div className="max-w-6xl space-y-4">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 bg-muted/40 border border-border rounded-lg p-1 w-fit">
        {(['queue', 'builder', 'webfinger'] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={cn('flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
              mode === m ? 'bg-card text-foreground border border-border shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {m === 'queue' ? <Code2 className="w-3.5 h-3.5" /> : m === 'builder' ? <Code2 className="w-3.5 h-3.5" /> : <Globe className="w-3.5 h-3.5" />}
            {m === 'queue' ? 'Queue Inspector' : m === 'builder' ? 'Payload Builder' : 'WebFinger Resolver'}
          </button>
        ))}
      </div>

      {/* Queue Inspector */}
      {mode === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by type or domain…"
                className="w-full pl-8 pr-3 py-1.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 font-mono" />
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden max-h-[520px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-muted-foreground font-mono flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground font-mono">No items found.</div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredItems.map(item => (
                    <button key={item.id} onClick={() => setSelectedId(item.id)}
                      className={cn('w-full text-left px-3 py-2.5 hover:bg-muted/30 transition-colors',
                        selectedId === item.id && 'bg-primary/8 border-l-2 border-primary')}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono text-foreground font-semibold">{item.activity_type}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">{item.target_domain ?? '—'}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">{timeAgo(item.created_at)}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-card border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">Recent Events</div>
              <div className="space-y-1.5">
                {(logs ?? []).slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-start gap-2">
                    <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                      log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-red-400')} />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">{log.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {selectedItem ? (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">{selectedItem.activity_type}</span>
                    <StatusBadge status={selectedItem.status} />
                    <span className="text-[11px] font-mono text-muted-foreground">{selectedItem.target_domain}</span>
                  </div>
                  <button onClick={() => handleCopy(selectedItem.activity_data)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}Copy
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-2.5 bg-muted/20 border-b border-border text-[11px] font-mono text-muted-foreground">
                  <span>Attempts: <span className="text-foreground">{selectedItem.attempts}/{selectedItem.max_attempts}</span></span>
                  <span>Inbox: <span className="text-foreground break-all">{selectedItem.target_inbox}</span></span>
                  <span>Scheduled: <span className="text-foreground">{timeAgo(selectedItem.scheduled_at)}</span></span>
                  {selectedItem.delivered_at && <span>Delivered: <span className="text-emerald-400">{timeAgo(selectedItem.delivered_at)}</span></span>}
                </div>
                {selectedItem.last_error && (
                  <div className="flex items-start gap-2 px-4 py-2.5 bg-red-400/5 border-b border-red-400/20">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] font-mono text-red-400">{selectedItem.last_error}</span>
                  </div>
                )}
                <div className="p-4 font-mono text-[12px] leading-6 overflow-x-auto max-h-[400px] overflow-y-auto">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3">activity_data payload</div>
                  <JsonNode data={selectedItem.activity_data} depth={0} />
                </div>
                <details className="border-t border-border">
                  <summary className="px-4 py-2 text-[11px] font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">Raw JSON</summary>
                  <pre className="px-4 pb-4 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">{JSON.stringify(selectedItem.activity_data, null, 2)}</pre>
                </details>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-16 flex flex-col items-center justify-center gap-3 text-center">
                <Code2 className="w-8 h-8 text-muted-foreground/30" />
                <div className="text-sm text-muted-foreground font-mono">Select an item to inspect its payload</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payload Builder */}
      {mode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-muted-foreground font-mono">Template</label>
              <select value={selectedTemplate} onChange={e => { setSelectedTemplate(e.target.value); setCustomJson(''); setJsonError(null); }}
                className="flex-1 px-2.5 py-1.5 bg-card border border-border rounded text-xs font-mono text-foreground focus:outline-none focus:border-primary/40">
                {Object.keys(AP_TEMPLATES).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-muted-foreground font-mono">Edit JSON</label>
                <button onClick={() => { setCustomJson(JSON.stringify(templatePayload, null, 2)); setJsonError(null); }}
                  className="text-[11px] font-mono text-primary hover:text-primary/80 transition-colors">Load template →</button>
              </div>
              <textarea value={customJson} onChange={e => handleCustomChange(e.target.value)} rows={18}
                placeholder={JSON.stringify(templatePayload, null, 2)}
                className={cn('w-full px-3 py-2.5 bg-background border rounded text-[12px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none',
                  jsonError ? 'border-red-400/40' : 'border-border focus:border-primary/40')} />
              {jsonError && <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-red-400"><AlertCircle className="w-3 h-3" />{jsonError}</div>}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Interactive Preview</div>
              <button onClick={() => handleCopy(parsedCustom ?? templatePayload)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                {copied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}Copy
              </button>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 font-mono text-[12px] leading-6 overflow-auto max-h-[540px]">
              <JsonNode data={parsedCustom ?? templatePayload} depth={0} />
            </div>
            <div className="bg-muted/20 border border-border rounded-lg p-3 space-y-1.5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-2">AP Spec Reference</div>
              <div className="text-[11px] font-mono text-muted-foreground space-y-1">
                <div>• <span className="text-foreground">@context</span>: <span className="text-emerald-400">"https://www.w3.org/ns/activitystreams"</span></div>
                <div>• <span className="text-foreground">type</span>: Create, Follow, Like, Announce, Undo, Delete, Accept, Reject</div>
                <div>• <span className="text-foreground">actor</span>: valid Actor URL at <span className="text-cyan-400">testagram.site</span></div>
                <div>• <span className="text-foreground">to / cc</span>: Public = <span className="text-cyan-400">activitystreams#Public</span></div>
                <div>• <span className="text-foreground">id</span>: globally unique dereferenceable URL</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WebFinger Resolver */}
      {mode === 'webfinger' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">Resolve Fediverse Handle via WebFinger</div>
            <form onSubmit={handleWebFinger} className="flex items-center gap-3">
              <div className="relative flex-1 max-w-96">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={wfHandle}
                  onChange={e => setWfHandle(e.target.value)}
                  placeholder="@alice@mastodon.social"
                  className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                />
              </div>
              <button type="submit" disabled={wfLoading || !wfHandle.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {wfLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
                {wfLoading ? 'Resolving…' : 'Resolve'}
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground font-mono mt-2">Fetches the WebFinger JRD and resolves the ActivityPub Actor object from the real Fediverse.</p>
          </div>

          {wfError && (
            <div className="flex items-start gap-3 bg-red-400/5 border border-red-400/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-mono text-red-400">{wfError}</p>
            </div>
          )}

          {wfResult && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-sm font-semibold text-foreground">WebFinger JRD</span>
                  <button onClick={() => handleCopy(wfResult)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    <Copy className="w-3 h-3" />Copy
                  </button>
                </div>
                <div className="p-4 font-mono text-[12px] leading-6 overflow-x-auto max-h-80">
                  <div className="text-[10px] uppercase text-muted-foreground/60 mb-2">subject: <span className="text-emerald-400">{wfResult.subject}</span></div>
                  <JsonNode data={wfResult} depth={0} />
                </div>
              </div>

              {wfActorResult && (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">ActivityPub Actor</span>
                    <button onClick={() => handleCopy(wfActorResult)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                      <Copy className="w-3 h-3" />Copy
                    </button>
                  </div>
                  <div className="p-4 font-mono text-[12px] leading-6 overflow-x-auto max-h-80">
                    <JsonNode data={wfActorResult} depth={0} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick lookup examples */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-[11px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-3">Quick Examples</div>
            <div className="flex flex-wrap gap-2">
              {['@Mastodon@mastodon.social', '@fosstodon@fosstodon.org', '@pixelfed@pixelfed.social'].map(handle => (
                <button key={handle} onClick={() => setWfHandle(handle)}
                  className="text-xs font-mono px-2.5 py-1 bg-muted/40 border border-border rounded text-muted-foreground hover:text-primary hover:border-primary/25 transition-colors">
                  {handle}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
