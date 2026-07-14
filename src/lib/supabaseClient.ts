import { createClient } from '@supabase/supabase-js';

const getCredentials = () => {
  if (typeof window === 'undefined') {
    return { url: null, key: null };
  }
  
  const localUrl = window.localStorage.getItem('SUPABASE_URL');
  const localKey = window.localStorage.getItem('SUPABASE_ANON_KEY');

  const url = localUrl || ((import.meta as any).env.VITE_SUPABASE_URL as string) || null;
  const key = localKey || ((import.meta as any).env.VITE_SUPABASE_ANON_KEY as string) || null;

  // Trim whitespace
  return { 
    url: url?.trim() || null, 
    key: key?.trim() || null 
  };
};

export const { url: supabaseUrl, key: supabaseAnonKey } = getCredentials();

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
