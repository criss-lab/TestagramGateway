import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { FederationInstance } from '@/types/federation';

export function useFederationInstances() {
  return useQuery({
    queryKey: ['federation_instances'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('federation_instances')
        .select('*')
        .order('account_count', { ascending: false });
      if (error) throw error;
      return data as FederationInstance[];
    },
  });
}
