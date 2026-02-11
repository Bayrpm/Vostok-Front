import { supabase } from "@/integrations/supabase/client";

export const validateAuthToken = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
            return null;
        }
        // Verificar con el servidor si el token es válido
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return null;
        }
        return session;
    } catch {
        return null;
    }
};