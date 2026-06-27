import { createClient } from '@supabase/supabase-js';

// Testagram ActivityPub Gateway — connected to the shared Testagram backend
const SUPABASE_URL = 'https://lrqqpudyrkmitbeilrqq.backend.onspace.ai';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwODIyMzAwNzYsImlhdCI6MTc2Njg3MDA3NiwiaXNzIjoib25zcGFjZSIsInJlZiI6ImxycXFwdWR5cmttaXRiZWlscnFxIiwicm9sZSI6ImFub24ifQ.2NJxa5VjrDwWrg4_sGT7GMHr0zTIlLfIkEgG7MtfhHI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
