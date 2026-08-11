/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : undefined) ||
  'https://blzivqutjglzzjtabxxh.supabase.co';

const SUPABASE_ANON_KEY =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseml2cXV0amdsenpqdGFieHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MzQ3NjcsImV4cCI6MjEwMjAxMDc2N30.vHbRnoxysn5NkXngQwnbbyUwb01AsbJZBgGNI4_ddic';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const getServiceSupabase = () => {
  const serviceKey =
    (typeof process !== 'undefined' ? process.env?.SUPABASE_SERVICE_ROLE_KEY : undefined) ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseml2cXV0amdsenpqdGFieHhoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQzNDc2NywiZXhwIjoyMTAyMDEwNzY3fQ.bGAKUvAZWxIZcDC-RlyS9dOU_dp2rhszE4-nYmWR034';
  return createClient(SUPABASE_URL, serviceKey);
};

