import { ArrowRight, ArrowLeft } from 'lucide-react';

const modules = [
  { label: 'Export',     color: 'text-emerald-400' },
  { label: 'Import',     color: 'text-violet-400'  },
  { label: 'Sync',       color: 'text-amber-400'   },
  { label: 'WebFinger',  color: 'text-cyan-400'    },
  { label: 'Inbox',      color: 'text-pink-400'    },
  { label: 'Outbox',     color: 'text-orange-400'  },
];

const platforms = [
  { name: 'Mastodon', border: 'border-violet-500/30 bg-violet-500/5', dot: 'bg-violet-400' },
  { name: 'Pixelfed', border: 'border-pink-500/30 bg-pink-500/5',     dot: 'bg-pink-400'   },
  { name: 'PeerTube', border: 'border-orange-500/30 bg-orange-500/5', dot: 'bg-orange-400' },
  { name: 'Threads',  border: 'border-blue-500/30 bg-blue-500/5',     dot: 'bg-blue-400'   },
];

const localItems = ['posts', 'profiles', 'comments', 'likes', 'follows'];

export default function ArchitectureDiagram() {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-5 font-mono">
        System Architecture
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {/* Testagram box */}
        <div className="flex-shrink-0 w-40 bg-muted/40 border border-border rounded-lg p-3.5">
          <div className="text-xs font-semibold text-foreground mb-0.5">Testagram</div>
          <div className="text-[10px] text-muted-foreground font-mono mb-3">React + Supabase</div>
          <div className="space-y-1.5">
            {localItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <div className="w-1 h-1 rounded-full bg-cyan-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows Testagram ↔ Gateway */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <ArrowRight className="w-4 h-4 text-cyan-400" />
          <ArrowLeft className="w-4 h-4 text-violet-400" />
        </div>

        {/* Gateway box */}
        <div className="flex-shrink-0 w-48 bg-primary/5 border border-primary/20 rounded-lg p-3.5">
          <div className="text-xs font-semibold text-primary mb-0.5">AP Gateway</div>
          <div className="text-[10px] text-muted-foreground font-mono mb-3">ActivityPub Protocol</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {modules.map((m) => (
              <div key={m.label} className={`text-[11px] font-mono ${m.color}`}>
                {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* Arrows Gateway ↔ Fediverse */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
          <ArrowRight className="w-4 h-4 text-cyan-400" />
          <ArrowLeft className="w-4 h-4 text-violet-400" />
        </div>

        {/* Fediverse platforms */}
        <div className="flex-1 min-w-48 grid grid-cols-2 gap-2">
          {platforms.map((p) => (
            <div key={p.name} className={`border rounded-lg px-3 py-2.5 flex items-center gap-2 ${p.border}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
              <span className="text-xs font-medium text-foreground">{p.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
