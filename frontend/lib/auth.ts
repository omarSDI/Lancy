/**
 * Lansy.ai — Supabase Auth Client
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign up with email and password.
 */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  
  if (data.session && typeof document !== 'undefined') {
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
  }
  
  return data;
}

/**
 * Sign in with email and password.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  if (data.session && typeof document !== 'undefined') {
    // Set a client-side cookie so middleware.ts knows the user is authenticated
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
  }
  
  return data;
}

/**
 * Sign in with OAuth provider (Google, GitHub).
 */
export async function signInWithProvider(provider: 'google' | 'github') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  if (typeof document !== 'undefined') {
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session.
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Get the current user.
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Get the current access token (JWT).
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token || null;
}
