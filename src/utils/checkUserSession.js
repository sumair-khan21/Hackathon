import { supabase } from "../lib/supabaseClient";

export const checkUserSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
};
