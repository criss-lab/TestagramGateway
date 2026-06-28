import { useState } from 'react';
import {
  Heart, MessageCircle, Repeat2, RefreshCw, ExternalLink,
  Filter, Globe, Clock, TrendingUp,
} from 'lucide-react';
import { useRemotePosts } from '@/hooks/useRemotePosts';
import { useFederationInstances } from '@/hooks/useFederationInstances';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import StatusBadge from '@/components/features/StatusBadge';

type SortMode = 'recent' | 'popular' | 'replies';

const INSTANCE_COLORS: Record<string, string> = {
  'mastodon.social': 'text-violet-400 border-violet-400/20 bg-violet-400/8',
  'pixelfed.social': 'text-pink-400 border-pink-400/20 bg-pink-400/8',
  'fosstodon.org': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/8',
  'chaos.social': 'text-orange-400 border-orange-400/20 bg-orange-400/8',
  'peertube.social': 'text-amber-400 border-amber-400/20 bg-amber-400/8',
};

function getInstanceDomain(handle: string): string {
  const parts = handle?.split('@');
  return parts?.length >= 3 ? parts[2] : parts?.[1] ?? '';
}

export default function FeedTimeline() {
  const { data: posts, isLoading, refetch, isFetching } = useRemotePosts();
  const { data: instances } = useFederationInstances();
  const [instanceFilter, setInstanceFilter] = useState('all');
  const [visFilter, setVisFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [typeFilter, setTypeFilter] = useState('all');

  const instanceOptions = instances?.map((i) => i.domain) ?? [];

  const sorted = [...(posts ?? [])]
    .filter((p) => {
      const domain = getInstanceDomain(p.remote_accounts?.handle ?? '');
      const matchInst = instanceFilter === 'all' || domain === instanceFilter;
      const matchVis = visFilter === 'all' || p.visibility === visFilter;
      const matchType = typeFilter === 'all' || p.content_type === typeFilter;
      return matchInst && matchVis && matchType;
    })
    .sort((a, b) => {
      if (sortMode === 'popular') return (b.likes_count + b.reposts_count) - (a.likes_count + a.reposts_count);
      if (sortMode === 'replies') return b.replies_count - a.replies_count;
      return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
    });

  const totalEngagement = posts?.reduce((s, p) => s + p.likes_count + p.replies_count + p.reposts_count, 0) ?? 0;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Top stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Total Posts</div>
            <div className="text-sm font-bold font-mono text-cyan-300">{formatNumber(posts?.length ?? 0)}</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Engagement</div>
            <div className="text-sm font-bold font-mono text-violet-300">{formatNumber(totalEngagement)}</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Instances</div>
            <div className="text-sm font-bold font-mono text-emerald-300">{instanceOptions.length}</div>
          </div>
        </div>
      </div>

      {/* Filters + sort */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />

        <select
          value={instanceFilter}
          onChange={(e) => setInstanceFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-primary/40"
        >
          <option value="all">All instances</option>
          {instanceOptions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={visFilter}
          onChange={(e) => setVisFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-primary/40"
        >
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-md text-xs font-mono text-foreground focus:outline-none focus:border-primary/40"
        >
          <option value="all">All types</option>
          <option value="Note">Note</option>
          <option value="Article">Article</option>
          <option value="Video">Video</option>
        </select>

        {/* Sort */}
        <div className="flex items-center gap-1 ml-auto">
          {(['recent', 'popular', 'replies'] as SortMode[]).map((s) => (
            <button
              key={s}
              onClick={() => setSortMode(s)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-mono border transition-all capitalize',
                sortMode === s
                  ? 'bg-primary/10 text-primary border-primary/25'
                  : 'text-muted-foreground border-border hover:text-foreground hover:bg-muted/60'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-muted-foreground border border-border rounded hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-16 flex items-center justify-center gap-2 text-muted-foreground text-sm font-mono">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading timeline…
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-16 text-center text-sm text-muted-foreground font-mono">
          No posts match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((post) => {
            const domain = getInstanceDomain(post.remote_accounts?.handle ?? '');
            const instanceColor = INSTANCE_COLORS[domain] ?? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/8';
            const isBoost = !!post.reblog_of;
            const isReply = !!post.in_reply_to;
            const engagement = post.likes_count + post.replies_count + post.reposts_count;

            return (
              <div
                key={post.id}
                className={cn(
                  'bg-card border rounded-lg p-4 hover:border-primary/20 transition-all group',
                  isBoost ? 'border-emerald-400/15' : isReply ? 'border-violet-400/15' : 'border-border'
                )}
              >
                {/* Thread/boost indicator */}
                {(isBoost || isReply) && (
                  <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono">
                    {isBoost && <><Repeat2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Boosted</span></>}
                    {isReply && !isBoost && <><MessageCircle className="w-3 h-3 text-violet-400" /><span className="text-violet-400">Reply</span></>}
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <img
                    src={post.remote_accounts?.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${post.remote_accounts?.handle}`}
                    alt=""
                    className="w-9 h-9 rounded-full bg-muted flex-shrink-0 object-cover mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-semibold text-foreground">
                        {post.remote_accounts?.display_name ?? 'Unknown'}
                      </span>
                      <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border', instanceColor)}>
                        {domain}
                      </span>
                      <StatusBadge status={post.visibility} />
                      <span className="ml-auto text-[11px] font-mono text-muted-foreground">
                        {post.published_at ? timeAgo(post.published_at) : '—'}
                      </span>
                      {post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                    {/* Handle */}
                    <div className="text-[11px] font-mono text-muted-foreground mb-2">
                      {post.remote_accounts?.handle}
                    </div>

                    {/* Content */}
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Reply chain info */}
                    {post.in_reply_to && (
                      <div className="mt-2 text-[11px] font-mono text-muted-foreground border-l-2 border-violet-400/30 pl-2">
                        ↩ In reply to: <span className="text-violet-400 break-all">{post.in_reply_to}</span>
                      </div>
                    )}

                    {/* Media attachments */}
                    {Array.isArray(post.media_attachments) && post.media_attachments.length > 0 && (
                      <div className="mt-2 flex gap-1.5 flex-wrap">
                        {post.media_attachments.slice(0, 4).map((m: any, i: number) => (
                          <div key={i} className="text-[10px] font-mono px-2 py-1 bg-muted/60 border border-border rounded text-muted-foreground">
                            📎 attachment {i + 1}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {(post.tags as any[]).slice(0, 6).map((tag: any, i: number) => (
                          <span key={i} className="text-[10px] font-mono text-primary/70 bg-primary/8 border border-primary/15 px-1.5 py-0.5 rounded">
                            #{typeof tag === 'string' ? tag : tag?.name ?? '—'}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement bar */}
                    <div className="flex items-center gap-5 mt-3 pt-3 border-t border-border/50">
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-pink-400 transition-colors cursor-default">
                        <Heart className="w-3.5 h-3.5" /> {formatNumber(post.likes_count)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-violet-400 transition-colors cursor-default">
                        <MessageCircle className="w-3.5 h-3.5" /> {formatNumber(post.replies_count)}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-emerald-400 transition-colors cursor-default">
                        <Repeat2 className="w-3.5 h-3.5" /> {formatNumber(post.reposts_count)}
                      </span>
                      <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wide">
                        {post.content_type}
                      </span>
                      {engagement > 100 && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-400/8 border border-amber-400/20 px-1.5 py-0.5 rounded">
                          🔥 {formatNumber(engagement)} eng.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
