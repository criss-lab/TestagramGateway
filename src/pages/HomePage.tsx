import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Flame } from 'lucide-react';
import FeedPost from '@/components/features/FeedPost';
import InstanceCard from '@/components/features/InstanceCard';
import UserCard from '@/components/features/UserCard';
import { Input } from '@/components/ui/input';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('feed');

  // Mock data for demonstration
  const mockPosts = [
    {
      id: '1',
      author: {
        name: 'Alice from Mastodon',
        handle: 'alice',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        instance: 'mastodon.social',
      },
      content: 'Just set up my new Mastodon instance! Excited to join the Fediverse! 🚀',
      timestamp: '2h ago',
      stats: { replies: 12, reposts: 45, likes: 234 },
    },
    {
      id: '2',
      author: {
        name: 'Bob from Pixelfed',
        handle: 'bob_photos',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        instance: 'pixelfed.social',
      },
      content: 'Beautiful sunset from today\'s hike 🌅',
      image: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=600&h=400&fit=crop',
      timestamp: '4h ago',
      stats: { replies: 8, reposts: 32, likes: 156 },
    },
  ];

  const mockInstances = [
    {
      id: '1',
      name: 'Mastodon',
      domain: 'mastodon.social',
      description: 'The original Mastodon server instance',
      userCount: 250000,
      postCount: 5000000,
      trending: true,
      status: 'active' as const,
    },
    {
      id: '2',
      name: 'Pixelfed',
      domain: 'pixelfed.social',
      description: 'Instagram alternative with privacy in mind',
      userCount: 80000,
      postCount: 2000000,
      trending: true,
      status: 'active' as const,
    },
    {
      id: '3',
      name: 'PeerTube',
      domain: 'peertube.example.com',
      description: 'Federated video platform',
      userCount: 50000,
      postCount: 500000,
      trending: false,
      status: 'active' as const,
    },
  ];

  const mockUsers = [
    {
      id: '1',
      name: 'Sarah Chen',
      handle: 'sarahchen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      description: 'Open source enthusiast, Fediverse advocate',
      followerCount: 5000,
      instance: 'fosstodon.org',
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      handle: 'marcusjohnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      description: 'Photography and travel blog',
      followerCount: 8500,
      instance: 'pixelfed.social',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, people, instances..."
            className="border-0 bg-muted/50 placeholder:text-muted-foreground focus-visible:ring-0"
          />
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="feed"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Following
          </TabsTrigger>
          <TabsTrigger
            value="discover"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Discover
          </TabsTrigger>
          <TabsTrigger
            value="instances"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            Instances
          </TabsTrigger>
          <TabsTrigger
            value="people"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent"
          >
            People
          </TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="border-l border-r border-border">
          <div>
            {mockPosts.map((post) => (
              <FeedPost key={post.id} {...post} />
            ))}
          </div>
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="border-l border-r border-border p-4">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Trending Now</h2>
              <div className="space-y-3">
                {mockPosts.map((post) => (
                  <div key={post.id} className="pb-3 border-b border-border last:border-0">
                    <div className="flex gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {post.author.name}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            @{post.author.handle}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Instances Tab */}
        <TabsContent value="instances" className="p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Popular Instances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockInstances.map((instance) => (
                <InstanceCard key={instance.id} {...instance} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* People Tab */}
        <TabsContent value="people" className="p-4">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Suggested People</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockUsers.map((user) => (
                <UserCard key={user.id} {...user} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
