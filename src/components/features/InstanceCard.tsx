import { Globe, Users, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface InstanceCardProps {
  id: string;
  name: string;
  domain: string;
  description?: string;
  userCount?: number;
  postCount?: number;
  trending?: boolean;
  status: 'active' | 'slow' | 'offline';
  onSubscribe?: () => void;
}

export default function InstanceCard({
  id,
  name,
  domain,
  description,
  userCount,
  postCount,
  trending,
  status,
  onSubscribe,
}: InstanceCardProps) {
  const statusColor = {
    active: 'bg-green-500/10 text-green-600 border-green-200/50',
    slow: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50',
    offline: 'bg-red-500/10 text-red-600 border-red-200/50',
  };

  return (
    <div className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-foreground">{name}</h3>
            {trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-1">{domain}</p>
        </div>
        <Badge className={`${statusColor[status]} border`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        {userCount !== undefined && (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-muted-foreground">{(userCount / 1000).toFixed(1)}k users</span>
          </div>
        )}
        {postCount !== undefined && (
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-muted-foreground">{(postCount / 1000).toFixed(1)}k posts</span>
          </div>
        )}
      </div>

      {/* Action */}
      <Button
        variant="outline"
        className="w-full text-xs h-8"
        onClick={onSubscribe}
      >
        Follow Instance
      </Button>
    </div>
  );
}
