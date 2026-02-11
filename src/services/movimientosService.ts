import { supabase } from "@/integrations/supabase/client";
import type { MovimientoInventario } from "@/types/movimiento";
import type { TipoComprobante } from "@/types/comprobante";

export const movimientosService = {
    async getMovimientos(empresaId: string): Promise<MovimientoInventario[]> {
        const { data, error } = await supabase
            .from("MovimientosInventario")
            .select(
                `
        *,
        ProductoEmpresa(
          *,
          Producto(Nombre),
          Categorias(Nombre)
        ),
        Usuarios(Nombres, ApellidoPaterno),
        Almacenes(Nombre)
      `,
            )
            .eq("EmpresaId", empresaId)
            .order("FechaMovimiento", { ascending: false });
        if (error) throw error;
        return data || [];
    },

    async getTiposMovimiento(): Promise<TipoComprobante[]> {
        const { data, error } = await supabase
            .from("TipoComprobante")
            .select("*")
            .order("Codigo");
        if (error) throw error;
        return data || [];
    },
};
