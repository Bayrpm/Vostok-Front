import type { CreateProductoPayload, DeleteProductoPayload, Producto } from "@/types/producto";

const API_URL = import.meta.env.VITE_API_URL;

export const productosService = {

    async createProducto(
        data: CreateProductoPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/productos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar producto");
        }
    },

    async getProductos(
        accessToken: string,
    ): Promise<Producto[]> {
        const response = await fetch(`${API_URL}/api/productos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener productos");
        }
        const result = await response.json();
        return result.data;
    },

    async deleteProducto(
        data: DeleteProductoPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/productos/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar producto");
        }
    }
};
