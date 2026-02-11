import { CreateProductoEmpresaPayload, UpdateProductoEmpresaPayload, DeleteProductoEmpresaPayload, ProductoEmpresa } from "@/types/productoEmpresa";

const API_URL = import.meta.env.VITE_API_URL;

export const productosEmpresaService = {

    async createProducto(
        data: CreateProductoEmpresaPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/productoEmpresa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar producto de empresa");
        }
    },

    async getProductosEmpresa(
        accessToken: string,
    ): Promise<ProductoEmpresa[]> {
        const response = await fetch(`${API_URL}/api/productoEmpresa`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al obtener productos de empresa");
        }
        const result = await response.json();
        return result.data;
    },

    async updateProductoEmpresa(
        data: UpdateProductoEmpresaPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/productoEmpresa/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar producto de empresa");
        }
    },

    async deleteProductoEmpresa(
        data: DeleteProductoEmpresaPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/productoEmpresa/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar producto de empresa");
        }
    }
};
