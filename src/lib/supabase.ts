import { createClient } from '@supabase/supabase-js';

// Testagram ActivityPub Gateway — connected to the shared Testagram backend
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lrqqpudyrkmitbeilrqq.backend.onspace.ai';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODIyMzAwNzYsImlhdCI6MTc2Njg3MDA3NiwiaXNzIjoib25zcGFjZSIsInJlZiI6ImxycXFwdWR5cmttaXRiZWlscnFxIiwicm9sZSI6ImFub24ifQ.2NJxa5VjrDwWrg4_sGT7GMHr0zTIlL';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Native fetch with retry logic (helps with low/slow networks for images & data)
const fetchWithRetry = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(input, init);
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      // Exponential backoff: 1s → 2s → 4s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError || new Error('Network request failed after retries');
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetchWithRetry,
  },
});
