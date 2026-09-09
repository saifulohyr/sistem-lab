import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials are not fully configured in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "lab";
