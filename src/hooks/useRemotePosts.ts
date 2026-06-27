import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { RemotePost } from '@/types/federation';

export function useRemotePosts() {
  return useQuery({
    queryKey: ['remote_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remote_posts')
        .select('*, remote_accounts(handle, display_name, avatar_url)')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return data as RemotePost[];
    },
  });
}
