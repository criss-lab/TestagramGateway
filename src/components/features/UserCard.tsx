import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserCardProps {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  description?: string;
  followerCount?: number;
  instance?: string;
  onFollow?: () => void;
}

export default function UserCard({
  id,
  name,
  handle,
  avatar,
  description,
  followerCount,
  instance,
  onFollow,
}: UserCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      {/* Avatar + Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <p className="text-xs text-muted-foreground font-mono truncate">@{handle}</p>
          {instance && (
            <p className="text-[10px] text-muted-foreground mt-1">{instance}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
      )}

      {/* Followers */}
      {followerCount !== undefined && (
        <p className="text-xs text-muted-foreground mb-3">
          <span className="font-semibold text-foreground">{(followerCount / 1000).toFixed(1)}k</span> followers
        </p>
      )}

      {/* Action */}
      <Button
        className="w-full text-xs h-8"
        onClick={onFollow}
      >
        Follow
      </Button>
    </div>
  );
}
