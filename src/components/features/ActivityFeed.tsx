import { CheckCircle2, AlertTriangle, XCircle, Download, Upload, RefreshCw, Globe, Fingerprint } from 'lucide-react';
import type { ActivityLog } from '@/types/federation';
import { timeAgo, cn } from '@/lib/utils';

const moduleIcon: Record<string, React.ElementType> = {
  import:    Download,
  export:    Upload,
  sync:      RefreshCw,
  routes:    Globe,
  webfinger: Fingerprint,
};

const statusStyles = {
  success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'hover:bg-emerald-400/5' },
  warning: { icon: AlertTriangle, color: 'text-amber-400',  bg: 'hover:bg-amber-400/5'   },
  error:   { icon: XCircle,       color: 'text-red-400',    bg: 'hover:bg-red-400/5'      },
};

const modulePill: Record<string, string> = {
  import:    'text-violet-400 bg-violet-400/10',
  export:    'text-emerald-400 bg-emerald-400/10',
  sync:      'text-cyan-400 bg-cyan-400/10',
  routes:    'text-amber-400 bg-amber-400/10',
  webfinger: 'text-pink-400 bg-pink-400/10',
};

interface Props {
  logs: ActivityLog[];
}

export default function ActivityFeed({ logs }: Props) {
  if (logs.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="text-sm text-muted-foreground font-mono">No activity yet</div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
      {logs.map((log) => {
        const s = statusStyles[log.status] ?? statusStyles.success;
        const StatusIcon = s.icon;
        const ModIcon = moduleIcon[log.module] ?? Globe;
        return (
          <div key={log.id} className={cn('flex items-start gap-3 px-4 py-3 transition-colors', s.bg)}>
            <StatusIcon className={cn('w-4 h-4 mt-0.5 flex-shrink-0', s.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{log.description ?? log.event_type}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={cn('flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded capitalize',
                  modulePill[log.module] ?? 'text-muted-foreground bg-muted')}>
                  <ModIcon className="w-2.5 h-2.5" />
                  {log.module}
                </span>
                <span className="text-[10px] text-muted-foreground/50">·</span>
                <span className="text-[11px] font-mono text-muted-foreground">{timeAgo(log.created_at)}</span>
                {log.event_type && log.event_type !== log.description && (
                  <>
                    <span className="text-[10px] text-muted-foreground/50">·</span>
                    <span className="text-[10px] font-mono text-muted-foreground/60">{log.event_type}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
