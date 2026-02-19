import type { CreateMovimientoInventarioPayload, MovimientoInventario } from "@/types/movimiento";
const API_URL = import.meta.env.VITE_API_URL;

export const movimientosService = {
    // Lista todos los movimientos
    async getMovimientos(accessToken: string): Promise<MovimientoInventario[]> {
        const response = await fetch(`${API_URL}/api/movimientosinventario`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener movimientos");
        }
        const result = await response.json();
        return result.data || result.datos || [];
    },

    // Obtiene un movimiento específico por ID
    async getMovimientoById(id: string, accessToken: string): Promise<MovimientoInventario> {
        const response = await fetch(`${API_URL}/api/movimientosinventario/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener movimiento");
        }
        const result = await response.json();
        return result.datos;
    },

    // Auditoría por producto (por productoEmpresaId)
    async getMovimientosByProducto(productoEmpresaId: string, accessToken: string): Promise<MovimientoInventario[]> {
        const response = await fetch(`${API_URL}/api/movimientosinventario/producto/${productoEmpresaId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener movimientos por producto");
        }
        const result = await response.json();
        return result.datos;
    },

    // Auditoría por almacén (por almacenId)
    async getMovimientosByAlmacen(almacenId: string, accessToken: string): Promise<MovimientoInventario[]> {
        const response = await fetch(`${API_URL}/api/movimientosinventario/almacen/${almacenId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener movimientos por almacén");
        }
        const result = await response.json();
        return result.datos;
    },
};
