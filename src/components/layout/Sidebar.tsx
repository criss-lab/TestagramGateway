import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Globe, ArrowDownCircle, ArrowUpCircle, RefreshCw, Radio,
  Activity, BarChart2, Code2, Rss, Twitter,
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
      { to: '/timeline',  icon: Radio,            label: 'Timeline',      end: false },
      { to: '/xclone',    icon: Twitter,          label: 'XClone Feed',   end: false },
    ],
  },
  {
    label: 'Federation',
    items: [
      { to: '/import',    icon: ArrowDownCircle,  label: 'Import Feed',   end: false },
      { to: '/export',    icon: ArrowUpCircle,    label: 'Export Queue',  end: false },
      { to: '/sync',      icon: RefreshCw,        label: 'Sync Status',   end: false },
    ],
  },
  {
    label: 'Developer',
    items: [
      { to: '/inspector', icon: Code2,    label: 'AP Inspector',  end: false },
      { to: '/analytics', icon: BarChart2, label: 'Analytics',    end: false },
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

      {/* Quick stats */}
      <div className="px-4 py-3 border-t border-border">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-2 font-mono">Live Stats</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Instances
            </span>
            <span className="text-[11px] font-mono text-foreground">{stats?.instances ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Posts
            </span>
            <span className="text-[11px] font-mono text-foreground">{stats?.posts ?? '—'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
              <ArrowUpCircle className="w-3 h-3" /> Queue
            </span>
            <span className="text-[11px] font-mono text-foreground">{stats?.queueTotal ?? '—'}</span>
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div className="px-4 py-4 border-t border-border space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">Auto-sync active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Rss className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[10px] text-muted-foreground/40 font-mono">testagram.site · v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
