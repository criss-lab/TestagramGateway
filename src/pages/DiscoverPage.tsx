import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Flame, TrendingUp, Zap } from 'lucide-react';
import InstanceCard from '@/components/features/InstanceCard';
import UserCard from '@/components/features/UserCard';
import FeedPost from '@/components/features/FeedPost';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');

  const trendingHashtags = [
    { tag: '#Mastodon', posts: 125000, trend: 'up' },
    { tag: '#Fediverse', posts: 89000, trend: 'up' },
    { tag: '#OpenSource', posts: 67000, trend: 'stable' },
    { tag: '#Privacy', posts: 56000, trend: 'up' },
    { tag: '#SocialMedia', posts: 45000, trend: 'down' },
    { tag: '#ActivityPub', posts: 34000, trend: 'up' },
  ];

  const trendingInstances = [
    {
      id: '1',
      name: 'Mastodon.social',
      domain: 'mastodon.social',
      description: 'The flagship Mastodon instance',
      userCount: 250000,
      postCount: 5000000,
      trending: true,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Fosstodon',
      domain: 'fosstodon.org',
      description: 'Community for free and open source software enthusiasts',
      userCount: 45000,
      postCount: 1200000,
      trending: true,
      status: 'active' as const,
    },
  ];

  const mockPosts = [
    {
      id: '1',
      author: {
        name: 'Dev News',
        handle: 'devnews',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevNews',
        instance: 'fosstodon.org',
      },
      content: 'New ActivityPub spec improvements announced! This will enhance federation across platforms.',
      timestamp: '1h ago',
      stats: { replies: 45, reposts: 234, likes: 890 },
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search Fediverse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 bg-muted/50 placeholder:text-muted-foreground focus-visible:ring-0"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="trending"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <Flame className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="instances"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Instances
          </TabsTrigger>
          <TabsTrigger
            value="hashtags"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
          >
            <Zap className="w-4 h-4 mr-2" />
            Hashtags
          </TabsTrigger>
        </TabsList>

        {/* Trending Posts */}
        <TabsContent value="trending" className="border-l border-r border-border">
          <div>
            {mockPosts.map((post) => (
              <FeedPost key={post.id} {...post} />
            ))}
          </div>
        </TabsContent>

        {/* Instances */}
        <TabsContent value="instances" className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Trending Instances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingInstances.map((instance) => (
              <InstanceCard key={instance.id} {...instance} />
            ))}
          </div>
        </TabsContent>

        {/* Hashtags */}
        <TabsContent value="hashtags" className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Trending Hashtags</h2>
          <div className="space-y-2">
            {trendingHashtags.map((item) => (
              <div
                key={item.tag}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.tag}</p>
                  <p className="text-sm text-muted-foreground">
                    {(item.posts / 1000).toFixed(0)}k posts
                  </p>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    item.trend === 'up'
                      ? 'text-green-500'
                      : item.trend === 'down'
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                  }`}
                >
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
