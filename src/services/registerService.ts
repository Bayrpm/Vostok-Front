import { supabase } from "@/integrations/supabase/client";
import type { Empresa } from "@/types/auth";

export const registerService = {
    async getEmpresas(): Promise<Empresa[]> {
        const { data, error } = await supabase
            .from("Empresas")
            .select("Id, Nombre, RutEmpresa")
            .eq("Activo", true);
        if (error) throw error;
        return data || [];
    },

    async registerUser(
        email: string,
        password: string,
        userData: {
            nombres: string;
            apellidoPaterno: string;
            apellidoMaterno: string;
            empresaId: string;
        },
    ) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: {
                    Nombres: userData.nombres,
                    ApellidoPaterno: userData.apellidoPaterno,
                    ApellidoMaterno: userData.apellidoMaterno,
                    EmpresaId: userData.empresaId,
                },
            },
        });

        if (authError) throw authError;

        if (!authData.user) {
            throw new Error("No se pudo crear el usuario");
        }

        const usuarioData = {
            Id: authData.user.id,
            Nombres: userData.nombres,
            ApellidoPaterno: userData.apellidoPaterno,
            ApellidoMaterno: userData.apellidoMaterno,
            Correo: email.trim(),
            EmpresaId: userData.empresaId,
        };

        // @ts-expect-error - Supabase type inference issue with Usuarios table
        const { error: profileError } = await supabase.from("Usuarios").insert([usuarioData]);

        if (profileError) throw profileError;

        return authData.user;
    },
};
