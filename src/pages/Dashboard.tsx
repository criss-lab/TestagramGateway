import { Globe, ArrowDownCircle, Send, RefreshCw, Activity, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/features/StatCard';
import ArchitectureDiagram from '@/components/features/ArchitectureDiagram';
import ActivityFeed from '@/components/features/ActivityFeed';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useFederationInstances } from '@/hooks/useFederationInstances';
import { formatNumber, timeAgo } from '@/lib/utils';
import StatusBadge from '@/components/features/StatusBadge';

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: logs } = useActivityLogs(15);
  const { data: instances } = useFederationInstances();

  const activeInstances = instances?.filter((i) => i.status === 'active').length ?? 0;
  const unhealthyInstances = instances?.filter((i) => i.status !== 'active').length ?? 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Health banner */}
      {unhealthyInstances > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-400/8 border border-amber-400/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            {unhealthyInstances} instance{unhealthyInstances > 1 ? 's are' : ' is'} unreachable or suspended — check the{' '}
            <a href="/instances" className="underline underline-offset-2 hover:text-amber-200 transition-colors">
              Instances
            </a>{' '}
            page.
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Instances"
          value={isLoading ? '—' : `${activeInstances}/${instances?.length ?? 0}`}
          icon={Globe}
          color="cyan"
          description="Fediverse servers online"
        />
        <StatCard
          label="Remote Accounts"
          value={isLoading ? '—' : formatNumber(stats?.accounts ?? 0)}
          icon={ArrowDownCircle}
          color="violet"
          description="Tracked actors"
        />
        <StatCard
          label="Imported Posts"
          value={isLoading ? '—' : formatNumber(stats?.posts ?? 0)}
          icon={Activity}
          color="emerald"
          description="Fetched from Fediverse"
        />
        <StatCard
          label="Delivery Queue"
          value={isLoading ? '—' : formatNumber(stats?.queueTotal ?? 0)}
          icon={Send}
          color={stats?.queueFailed ? 'red' : 'amber'}
          badge={stats?.queueFailed ? `${stats.queueFailed} failed` : undefined}
          description={`${stats?.queuePending ?? 0} pending · ${stats?.queueFailed ?? 0} failed`}
        />
      </div>

      {/* Architecture diagram */}
      <ArchitectureDiagram />

      {/* Two-column bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent activity — wider */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
            <span className="text-[11px] text-muted-foreground font-mono">{logs?.length ?? 0} events</span>
          </div>
          <ActivityFeed logs={logs ?? []} />
        </div>

        {/* Instance health — narrower */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Instance Health</h2>
            <span className="text-[11px] text-muted-foreground font-mono">{instances?.length ?? 0} total</span>
          </div>
          <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
            {instances?.slice(0, 6).map((inst) => (
              <div key={inst.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-foreground truncate">{inst.domain}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5 flex items-center gap-1.5">
                    <span className="capitalize">{inst.software}</span>
                    <span className="opacity-40">·</span>
                    <span>{inst.last_seen_at ? timeAgo(inst.last_seen_at) : '—'}</span>
                  </div>
                </div>
                <StatusBadge status={inst.status} pulse={inst.status === 'active'} />
              </div>
            ))}
            {!instances?.length && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground font-mono flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
