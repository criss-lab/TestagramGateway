import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Globe, ArrowDownCircle, ArrowUpCircle, RefreshCw, Radio,
  Activity, BarChart2, Code2, Rss, Twitter, ShieldOff, Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import logo from '@/assets/logo.png';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/',          icon: LayoutDashboard, label: 'Dashboard',     end: true  },
      { to: '/instances', icon: Globe,            label: 'Instances',     end: false },
      { to: '/timeline',  icon: Radio,            label: 'Live Timeline', end: false },
      { to: '/xclone',    icon: Twitter,          label: 'XClone Feed',   end: false },
    ],
  },
  {
    label: 'ActivityPub',
    items: [
      { to: '/import',    icon: ArrowDownCircle,  label: 'Import Feed',   end: false },
      { to: '/export',    icon: ArrowUpCircle,    label: 'Export Queue',  end: false },
      { to: '/sync',      icon: RefreshCw,        label: 'Sync Status',   end: false },
    ],
  },
  {
    label: 'Developer',
    items: [
      { to: '/inspector', icon: Code2,    label: 'AP Inspector',   end: false },
      { to: '/analytics', icon: BarChart2, label: 'Analytics',     end: false },
      { to: '/blocked',   icon: ShieldOff, label: 'Blocked',       end: false },
      { to: '/schema',    icon: Database,  label: 'AP Schema',     end: false },
    ],
  },
];

export default function Sidebar() {
  const { data: stats } = useDashboardStats();

  return (
    <aside className="w-56 flex-shrink-0 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Gateway Logo" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground leading-none">Testagram</div>
            <div className="text-[11px] text-muted-foreground mt-0.5 font-mono tracking-wide">AP Gateway · .site</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-2 font-mono">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 group',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'group-hover:text-foreground')} />
                      <span className="font-medium flex-1">{label}</span>
                      {to === '/export' && stats?.queueFailed ? (
                        <span className="text-[10px] font-mono bg-red-400/15 text-red-400 border border-red-400/20 px-1.5 rounded">
                          {stats.queueFailed}
                        </span>
                      ) : isActive ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      ) : null}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* AP Endpoint indicators */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-mono">AP Endpoints</div>
        <div className="space-y-1">
          {[
            { path: '/webfinger', label: 'WebFinger', color: 'bg-cyan-400' },
            { path: '/actor',     label: 'Actor',     color: 'bg-violet-400' },
            { path: '/inbox',     label: 'Inbox',     color: 'bg-emerald-400' },
            { path: '/outbox',    label: 'Outbox',    color: 'bg-amber-400' },
            { path: '/nodeinfo',  label: 'NodeInfo',  color: 'bg-pink-400' },
          ].map((ep) => (
            <div key={ep.path} className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse', ep.color)} />
              <span className="text-[10px] font-mono text-muted-foreground/60 flex-1">{ep.label}</span>
              <span className="text-[9px] font-mono text-muted-foreground/30">active</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-mono">Live Stats</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <Globe className="w-3 h-3" />Instances
            </span>
            <span className="text-[11px] font-mono text-foreground">{stats?.instances ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <Activity className="w-3 h-3" />Queue
            </span>
            <span className="text-[11px] font-mono text-foreground">{stats?.queueTotal ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className="px-4 py-4 border-t border-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">Federation active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Rss className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40 font-mono">testagram.site · v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
