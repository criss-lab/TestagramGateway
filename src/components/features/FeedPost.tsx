import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface FeedPostProps {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
    instance?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  stats: {
    replies: number;
    reposts: number;
    likes: number;
  };
  liked?: boolean;
  onLike?: () => void;
}

export default function FeedPost({
  id,
  author,
  content,
  image,
  timestamp,
  stats,
  liked = false,
  onLike,
}: FeedPostProps) {
  return (
    <div className="border-b border-border hover:bg-muted/50 transition-colors p-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-10 h-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <a href="#" className="hover:underline font-semibold text-foreground">
              {author.name}
            </a>
            <span className="text-muted-foreground">@{author.handle}</span>
            {author.instance && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">{author.instance}</span>
              </>
            )}
            <span className="text-muted-foreground ml-auto text-sm">{timestamp}</span>
          </div>

          {/* Body */}
          <p className="text-foreground mt-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {content}
          </p>

          {/* Image */}
          {image && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-border">
              <img
                src={image}
                alt="Post media"
                className="w-full h-auto max-h-80 object-cover"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-8 mt-3 text-muted-foreground text-sm max-w-xs">
            <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-500 hover:bg-blue-500/10">
              <MessageCircle className="w-4 h-4" />
              <span>{stats.replies}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-green-500 hover:bg-green-500/10">
              <Repeat2 className="w-4 h-4" />
              <span>{stats.reposts}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hover:text-red-500 hover:bg-red-500/10"
              onClick={onLike}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{stats.likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 hover:text-blue-500 hover:bg-blue-500/10">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
