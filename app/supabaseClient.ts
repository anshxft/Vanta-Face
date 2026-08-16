"use client";

import { createClient } from "@supabase/supabase-js";

const fallbackSupabaseUrl = "https://fhosxfhjykvlxhvjnugv.supabase.co";
const fallbackSupabaseAnonKey = "sb_publishable_Sf5E3_Jg08FKgF1tPRTrKg_D5iUk0eN";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;
