import { supabase } from "@/integrations/supabase/client";

export const login = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
    });
};