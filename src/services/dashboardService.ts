import { productosEmpresaService } from "./productosEmpresaService";
import { categoriaService } from "./categoriaService";
import { movimientosService } from "./movimientosService";
import type { ProductoEmpresa } from "@/types/productoEmpresa";
import type { Categoria } from "@/types/categoria";
import type { MovimientoInventario } from "@/types/movimiento";

export const dashboardService = {
    async getProductosEmpresa(accessToken: string): Promise<ProductoEmpresa[]> {
        return await productosEmpresaService.getProductosEmpresa(accessToken);
    },

    async getCategoriasEmpresa(accessToken: string): Promise<Categoria[]> {
        return await categoriaService.getCategorias(accessToken);
    },

    async getMovimientosRecientes(
        accessToken: string,
        limit: number = 5,
    ): Promise<MovimientoInventario[]> {
        const movimientos = await movimientosService.getMovimientos(accessToken);
        return movimientos?.slice(0, limit) || [];
    },
};

