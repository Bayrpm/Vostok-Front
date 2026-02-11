import { supabase } from "@/integrations/supabase/client";
import type { ProductoEmpresa, Stock } from "@/types/producto";
import type { Categoria } from "@/types/categoria";
import type { MovimientoInventario } from "@/types/movimiento";

type ProductoEmpresaWithStock = ProductoEmpresa & { Stock: Stock[] };

export const dashboardService = {
    async getProductosEmpresa(
        empresaId: string,
    ): Promise<ProductoEmpresaWithStock[]> {
        const { data, error } = await supabase
            .from("ProductoEmpresa")
            .select("*, Stock(*)")
            .eq("EmpresaId", empresaId)
            .eq("Activo", true);
        if (error) throw error;
        return (data as ProductoEmpresaWithStock[]) || [];
    },

    async getCategoriasEmpresa(empresaId: string): Promise<Categoria[]> {
        const { data, error } = await supabase
            .from("Categorias")
            .select("Id")
            .eq("EmpresaId", empresaId)
            .eq("Activo", true);
        if (error) throw error;
        return data || [];
    },

    async getMovimientosRecientes(empresaId: string): Promise<MovimientoInventario[]> {
        const { data, error } = await supabase
            .from("MovimientosInventario")
            .select("*")
            .eq("EmpresaId", empresaId)
            .order("FechaMovimiento", { ascending: false })
            .limit(5);
        if (error) throw error;
        return data || [];
    },

    calculateStockStatus(productos: ProductoEmpresaWithStock[]) {
        const stockBajo = productos?.filter((p) => {
            const stock = p.Stock?.[0];
            return stock && stock.CantidadActual <= (stock.CantidadReservada || 0);
        }) || [];

        const sinStock = productos?.filter((p) => {
            const stock = p.Stock?.[0];
            return !stock || stock.CantidadActual === 0;
        }) || [];

        const stockSaludable = productos?.filter((p) => {
            const stock = p.Stock?.[0];
            return stock && stock.CantidadActual > (stock.CantidadReservada || 0);
        }) || [];

        return { stockBajo, sinStock, stockSaludable };
    },
};
