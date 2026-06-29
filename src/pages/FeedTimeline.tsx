import { useState, useMemo } from 'react';
import {
  Heart, MessageCircle, Repeat2, RefreshCw, ExternalLink,
  Filter, Globe, Clock, TrendingUp, Share2, UserPlus, UserMinus,
  Hash, Send, X,
} from 'lucide-react';
import { useRemotePosts } from '@/hooks/useRemotePosts';
import { useFederationInstances } from '@/hooks/useFederationInstances';
import {
  usePostInteractions, useAccountFollows,
  useLikePost, useRepostPost, useReplyPost, useFollowAccount, usePostToFediverse,
} from '@/hooks/usePostInteractions';
import { formatNumber, timeAgo, cn } from '@/lib/utils';
import StatusBadge from '@/components/features/StatusBadge';
import type { RemotePost } from '@/types/federation';

type SortMode = 'recent' | 'popular' | 'replies';

const INSTANCE_COLORS: Record<string, string> = {
  'mastodon.social': 'text-violet-400 border-violet-400/20 bg-violet-400/10',
  'pixelfed.social': 'text-pink-400 border-pink-400/20 bg-pink-400/10',
  'fosstodon.org': 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10',
  'chaos.social': 'text-orange-400 border-orange-400/20 bg-orange-400/10',
  'peertube.social': 'text-amber-400 border-amber-400/20 bg-amber-400/10',
  'infosec.exchange': 'text-red-400 border-red-400/20 bg-red-400/10',
  'mstdn.social': 'text-blue-400 border-blue-400/20 bg-blue-400/10',
  'threads.net': 'text-sky-400 border-sky-400/20 bg-sky-400/10',
  'mastodon.online': 'text-indigo-400 border-indigo-400/20 bg-indigo-400/10',
  'journalism.social': 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
  'indieweb.social': 'text-teal-400 border-teal-400/20 bg-teal-400/10',
};

function getInstanceDomain(handle: string): string {
  const parts = handle?.split('@');
  return parts?.length >= 3 ? parts[2] : parts?.[1] ?? '';
}

// Compose post panel
function ComposePanel({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState('');
  const [domains, setDomains] = useState('mastodon.social,fosstodon.org');
  const postMut = usePostToFediverse();

  function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    postMut.mutate({
      content,
      targetDomains: domains.split(',').map((d) => d.trim()).filter(Boolean),
    });
    setContent('');
    onClose();
  }

  return (
    <form onSubmit={handlePost} className="bg-card border border-primary/25 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Post to Fediverse</span>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 font-mono text-primary text-xs font-bold">me</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="What's on your mind? (ActivityPub Note)"
          maxLength={500}
          className="flex-1 resize-none bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
        />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-[11px] text-muted-foreground font-mono mb-1 block">Target instances (comma-separated)</label>
          <input
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            className="w-full px-2.5 py-1 bg-background border border-border rounded text-xs font-mono text-foreground focus:outline-none focus:border-primary/40"
          />
        </div>
        <div className="text-[11px] font-mono text-muted-foreground self-end pb-1">{content.length}/500</div>
        <button
          type="submit"
          disabled={!content.trim() || postMut.isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 self-end"
        >
          {postMut.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Post
        </button>
      </div>
    </form>
  );
}

// Reply modal
function ReplyModal({ post, onClose }: { post: RemotePost; onClose: () => void }) {
  const [content, setContent] = useState('');
  const replyMut = useReplyPost();
  const domain = getInstanceDomain(post.remote_accounts?.handle ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    replyMut.mutate({ postId: post.id, content, targetDomain: domain });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Reply via ActivityPub</span>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>
        {/* Original post preview */}
        <div className="bg-muted/30 border border-border rounded-lg p-3 border-l-2 border-l-primary/40">
          <div className="text-[11px] font-mono text-primary mb-1">{post.remote_accounts?.handle}</div>
          <p className="text-xs text-muted-foreground line-clamp-3">{post.content}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-[10px] font-bold font-mono">me</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder={`Replying to ${post.remote_accounts?.handle}…`}
              maxLength={500}
              autoFocus
              className="flex-1 resize-none bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-muted-foreground">Will be delivered to <span className="text-foreground">{domain}</span></span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded hover:bg-muted/60 transition-colors">Cancel</button>
              <button type="submit" disabled={!content.trim() || replyMut.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50">
                {replyMut.isPending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Reply
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Post card with full interactions
function PostCard({ post, interactions, follows }: { post: RemotePost; interactions: any[]; follows: any[] }) {
  const [showReply, setShowReply] = useState(false);
  const likeMut = useLikePost();
  const repostMut = useRepostPost();
  const followMut = useFollowAccount();

  const domain = getInstanceDomain(post.remote_accounts?.handle ?? '');
  const instanceColor = INSTANCE_COLORS[domain] ?? 'text-cyan-400 border-cyan-400/20 bg-cyan-400/10';
  const isLiked = interactions.some((i) => i.post_id === post.id && i.action === 'like');
  const isReposted = interactions.some((i) => i.post_id === post.id && i.action === 'repost');
  const isFollowing = follows.some((f) => f.remote_account_id === post.remote_account_id && f.status === 'following');
  const engagement = post.likes_count + post.replies_count + post.reposts_count;
  const isBoost = !!post.reblog_of;
  const isReply = !!post.in_reply_to;

  function handleShare() {
    if (post.url) {
      navigator.clipboard.writeText(post.url);
      import('sonner').then(({ toast }) => toast.success('Post URL copied to clipboard!'));
    }
  }

  return (
    <>
      <div className={cn(
        'bg-card border rounded-xl p-4 hover:border-primary/20 transition-all group',
        isLiked ? 'border-pink-400/20' : isReposted ? 'border-emerald-400/20' : isBoost ? 'border-emerald-400/10' : isReply ? 'border-violet-400/10' : 'border-border'
      )}>
        {(isBoost || isReply) && (
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-mono">
            {isBoost && <><Repeat2 className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Boosted</span></>}
            {isReply && !isBoost && <><MessageCircle className="w-3 h-3 text-violet-400" /><span className="text-violet-400">Reply</span></>}
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={post.remote_accounts?.avatar_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${post.remote_accounts?.handle}`}
              alt=""
              className="w-10 h-10 rounded-full bg-muted object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className="text-sm font-semibold text-foreground">{post.remote_accounts?.display_name ?? 'Unknown'}</span>
              <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded border', instanceColor)}>{domain}</span>
              <StatusBadge status={post.visibility} />
              {engagement > 200 && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/8 border border-amber-400/20 px-1.5 py-0.5 rounded">🔥 trending</span>
              )}
              <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                <span className="text-[11px] font-mono text-muted-foreground">{post.published_at ? timeAgo(post.published_at) : '—'}</span>
                {post.url && (
                  <a href={post.url} target="_blank" rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Handle + follow */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] font-mono text-muted-foreground">{post.remote_accounts?.handle}</span>
              <button
                onClick={() => followMut.mutate({
                  accountId: post.remote_account_id ?? '',
                  handle: post.remote_accounts?.handle ?? '',
                  domain,
                  isFollowing,
                })}
                disabled={followMut.isPending || !post.remote_account_id}
                className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all opacity-0 group-hover:opacity-100',
                  isFollowing
                    ? 'text-muted-foreground border-border hover:text-red-400 hover:border-red-400/20'
                    : 'text-primary border-primary/20 bg-primary/8 hover:bg-primary/15'
                )}
              >
                {isFollowing ? <><UserMinus className="w-3 h-3" />Unfollow</> : <><UserPlus className="w-3 h-3" />Follow</>}
              </button>
            </div>

            {/* Content */}
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Reply chain */}
            {post.in_reply_to && (
              <div className="mt-2 text-[11px] font-mono text-muted-foreground border-l-2 border-violet-400/30 pl-2">
                ↩ In reply to: <span className="text-violet-400 break-all">{post.in_reply_to}</span>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {(post.tags as any[]).slice(0, 6).map((tag: any, i: number) => (
                  <span key={i} className="flex items-center gap-0.5 text-[10px] font-mono text-primary/70 bg-primary/8 border border-primary/15 px-1.5 py-0.5 rounded">
                    <Hash className="w-2.5 h-2.5" />
                    {typeof tag === 'string' ? tag : tag?.name ?? '—'}
                  </span>
                ))}
              </div>
            )}

            {/* Action bar */}
            <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-border/50">
              {/* Like */}
              <button
                onClick={() => likeMut.mutate({ postId: post.id, isLiked })}
                disabled={likeMut.isPending}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-mono transition-all min-w-0',
                  isLiked
                    ? 'text-pink-400 bg-pink-400/10 border border-pink-400/20'
                    : 'text-muted-foreground hover:text-pink-400 hover:bg-pink-400/8 border border-transparent'
                )}
              >
                <Heart className={cn('w-3.5 h-3.5', isLiked && 'fill-current')} />
                {formatNumber(post.likes_count)}
              </button>

              {/* Reply */}
              <button
                onClick={() => setShowReply(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-mono text-muted-foreground hover:text-violet-400 hover:bg-violet-400/8 border border-transparent transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                {formatNumber(post.replies_count)}
              </button>

              {/* Repost */}
              <button
                onClick={() => repostMut.mutate({ postId: post.id, isReposted })}
                disabled={repostMut.isPending}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-mono transition-all border',
                  isReposted
                    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                    : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/8 border-transparent'
                )}
              >
                <Repeat2 className="w-3.5 h-3.5" />
                {formatNumber(post.reposts_count)}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-mono text-muted-foreground hover:text-cyan-400 hover:bg-cyan-400/8 border border-transparent transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>

              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 uppercase tracking-wide">{post.content_type}</span>
            </div>
          </div>
        </div>
      </div>

      {showReply && <ReplyModal post={post} onClose={() => setShowReply(false)} />}
    </>
  );
}

export default function FeedTimeline() {
  const { data: posts, isLoading, refetch, isFetching } = useRemotePosts();
  const { data: instances } = useFederationInstances();
  const { data: interactions = [] } = usePostInteractions();
  const { data: follows = [] } = useAccountFollows();
  const [instanceFilter, setInstanceFilter] = useState('all');
  const [visFilter, setVisFilter] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [tagFilter, setTagFilter] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [showTrending, setShowTrending] = useState(true);

  const instanceOptions = instances?.map((i) => i.domain) ?? [];

  // Compute trending hashtags from all posts
  const trendingTags = useMemo(() => {
    if (!posts?.length) return [];
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      if (!Array.isArray(p.tags)) return;
      (p.tags as any[]).forEach((tag: any) => {
        const name = typeof tag === 'string' ? tag : tag?.name;
        if (name) counts[name] = (counts[name] ?? 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const sorted = useMemo(() => {
    return [...(posts ?? [])]
      .filter((p) => {
        const domain = getInstanceDomain(p.remote_accounts?.handle ?? '');
        const matchInst = instanceFilter === 'all' || domain === instanceFilter;
        const matchVis = visFilter === 'all' || p.visibility === visFilter;
        const matchTag = !tagFilter || (Array.isArray(p.tags) && (p.tags as any[]).some((t) => {
          const name = typeof t === 'string' ? t : t?.name;
          return name?.toLowerCase() === tagFilter.toLowerCase();
        }));
        return matchInst && matchVis && matchTag;
      })
      .sort((a, b) => {
        if (sortMode === 'popular') return (b.likes_count + b.reposts_count) - (a.likes_count + a.reposts_count);
        if (sortMode === 'replies') return b.replies_count - a.replies_count;
        return new Date(b.published_at ?? b.created_at).getTime() - new Date(a.published_at ?? a.created_at).getTime();
      });
  }, [posts, instanceFilter, visFilter, sortMode, tagFilter]);

  const totalEngagement = posts?.reduce((s, p) => s + p.likes_count + p.replies_count + p.reposts_count, 0) ?? 0;

  return (
    <div className="max-w-4xl space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Total Posts</div>
            <div className="text-sm font-bold font-mono text-cyan-300">{formatNumber(posts?.length ?? 0)}</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-violet-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Engagement</div>
            <div className="text-sm font-bold font-mono text-violet-300">{formatNumber(totalEngagement)}</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Clock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs text-muted-foreground">Instances</div>
            <div className="text-sm font-bold font-mono text-emerald-300">{instanceOptions.length}</div>
          </div>
        </div>
      </div>

      {/* Compose button */}
      <button
        onClick={() => setShowCompose((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all text-sm"
      >
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold font-mono flex-shrink-0">me</div>
        <span>What's happening on the Fediverse?</span>
        <Send className="w-4 h-4 ml-auto text-primary" />
      </button>

      {showCompose && <ComposePanel onClose={() => setShowCompose(false)} />}

      {/* Trending hashtags */}
      {trendingTags.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-3">
          <button
            onClick={() => setShowTrending((p) => !p)}
            className="flex items-center gap-2 w-full text-left"
          >
            <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-mono flex-1">Trending Hashtags</span>
            <span className="text-[11px] font-mono text-muted-foreground/40">{showTrending ? '▲' : '▼'}</span>
          </button>
          {showTrending && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {tagFilter && (
                <button
                  onClick={() => setTagFilter('')}
                  className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-red-400/10 border border-red-400/20 text-red-400 rounded hover:bg-red-400/20 transition-colors"
                >
                  <X className="w-3 h-3" /> Clear filter
                </button>
              )}
              {trendingTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded border transition-all',
                    tagFilter === tag
                      ? 'bg-primary/15 border-primary/30 text-primary'
                      : 'bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
                  )}
                >
                  <Hash className="w-3 h-3" />{tag}
                  <span className="text-[10px] opacity-60 ml-0.5">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters + sort toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <select value={instanceFilter} onChange={(e) => setInstanceFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary/40">
          <option value="all">All instances</option>
          {instanceOptions.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={visFilter} onChange={(e) => setVisFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-card border border-border rounded-lg text-xs font-mono text-foreground focus:outline-none focus:border-primary/40">
          <option value="all">All visibility</option>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
        <div className="flex items-center gap-1 ml-auto">
          {(['recent', 'popular', 'replies'] as SortMode[]).map((s) => (
            <button key={s} onClick={() => setSortMode(s)}
              className={cn('px-2.5 py-1 rounded-lg text-xs font-mono border transition-all capitalize',
                sortMode === s ? 'bg-primary/10 text-primary border-primary/25' : 'text-muted-foreground border-border hover:text-foreground hover:bg-muted/60')}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-muted-foreground border border-border rounded-lg hover:text-foreground hover:bg-muted/60 transition-colors">
          <RefreshCw className={cn('w-3 h-3', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Tag filter active badge */}
      {tagFilter && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground font-mono">Filtering by:</span>
          <span className="flex items-center gap-1 text-[12px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
            <Hash className="w-3 h-3" />{tagFilter}
          </span>
          <button onClick={() => setTagFilter('')} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Timeline */}
      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-16 flex items-center justify-center gap-2 text-muted-foreground text-sm font-mono">
          <RefreshCw className="w-4 h-4 animate-spin" /> Loading timeline…
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-sm text-muted-foreground font-mono">
          No posts match the selected filters.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              interactions={interactions}
              follows={follows}
            />
          ))}
        </div>
      )}
    </div>
  );
}
