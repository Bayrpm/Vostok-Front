import type { Categoria, CreateCategoriaPayload, UpdateCategoriaPayload } from "@/types/categoria";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Servicio centralizado para todas las operaciones de categorías
 *
 * Proporciona métodos para gestionar categorías mediante la API REST
 * Todos los endpoints requieren autenticación con token Bearer
 */
export const categoriaService = {
    /**
     * GET /api/Categorias
     * Obtiene la lista completa de todas las categorías
     *
     * @param accessToken - Token de autenticación Bearer
     * @returns Promesa con array de todas las categorías
     *
     * @example
     * const categorias = await categoriaService.getCategorias(accessToken, empresaId);
     */
    async getCategorias(accessToken: string, empresaId?: string): Promise<Categoria[]> {
        const endpoint = `${API_URL}/api/Categorias`;
        const headers = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        };

        console.log("📤 GET /api/Categorias - Request:", {
            endpoint,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken.substring(0, 20)}...` // Mostrar solo parte del token por seguridad
            },
        });

        const response = await fetch(endpoint, {
            method: "GET",
            headers,
        });

        console.log("📥 GET /api/Categorias - Response Status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ GET /api/Categorias - Error:", {
                status: response.status,
                statusText: response.statusText,
                error: errorText,
            });
            throw new Error("Error al obtener categorías");
        }

        const data = await response.json();
        console.log("✅ GET /api/Categorias - Data recibida:", data);

        // Asegurar que siempre retornamos un array y mapear las propiedades
        interface RawCategoria {
            id: string;
            nombre: string;
            empresaId?: string;
            categoriaPadreId?: string;
        }

        let categoriasArray: RawCategoria[] = [];
        if (Array.isArray(data)) {
            categoriasArray = data;
        } else if (data && typeof data === 'object') {
            // Si es un objeto, intentar extraer la propiedad que contiene el array
            const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
            if (arrayKey) {
                categoriasArray = data[arrayKey];
            }
        }

        // Mapear las propiedades del backend al formato esperado por el frontend
        const categoriasMapeadas = categoriasArray.map(cat => ({
            Id: cat.id,
            Nombre: cat.nombre,
            EmpresaId: empresaId || cat.empresaId || '',
            CategoriaPadreId: cat.categoriaPadreId,
            Activo: true, // Asumir activo por defecto
        }));

        return categoriasMapeadas;
    },

    /**
     * GET /api/Categorias/{id}
     * Obtiene una categoría específica por su ID
     *
     * @param id - ID única de la categoría
     * @param accessToken - Token de autenticación Bearer
     * @returns Promesa con los datos de la categoría
     *
     * @example
     * const categoria = await categoriaService.getCategoriaById("123", accessToken);
     */
    async getCategoriaById(id: string, accessToken: string): Promise<Categoria> {
        const response = await fetch(`${API_URL}/api/Categorias/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Error al obtener la categoría");
        }

        return response.json();
    },

    /**
     * POST /api/Categorias
     * Crea una nueva categoría
     *
     * @param data - Payload con los datos de la nueva categoría
     * @param data.Nombre - Nombre de la categoría (requerido)
     * @param data.CategoriaPadreId - ID de la categoría padre (opcional)
     * @param data.EmpresaId - ID de la empresa (requerido)
     * @param accessToken - Token de autenticación Bearer
     *
     * @example
     * await categoriaService.createCategoria({
     *   Nombre: "Electrónica",
     *   EmpresaId: "empresa123",
     *   CategoriaPadreId: undefined
     * }, accessToken);
     */
    async createCategoria(
        data: CreateCategoriaPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/Categorias`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar categoría");
        }
    },

    /**
     * PUT /api/Categorias/{id}
     * Actualiza una categoría existente
     *
     * @param id - ID única de la categoría a actualizar
     * @param data - Payload con los datos actualizados
     * @param data.Nombre - Nuevo nombre de la categoría
     * @param data.CategoriaPadreId - Nueva categoría padre (opcional)
     * @param data.EmpresaId - ID de la empresa (requerido)
     * @param accessToken - Token de autenticación Bearer
     *
     * @example
     * await categoriaService.updateCategoria("123", {
     *   Nombre: "Electrónica Actualizada",
     *   EmpresaId: "empresa123",
     *   CategoriaPadreId: null
     * }, accessToken);
     */
    async updateCategoria(
        id: string,
        data: UpdateCategoriaPayload,
        accessToken: string,
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/Categorias/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al guardar categoría");
        }
    },

    /**
     * DELETE /api/Categorias/{id}
     * Elimina una categoría existente
     *
     * @param id - ID única de la categoría a eliminar
     * @param accessToken - Token de autenticación Bearer
     *
     * @throws Error si la categoría tiene productos asociados o si hay error en la eliminación
     *
     * @example
     * await categoriaService.deleteCategoria("123", accessToken);
     */
    async deleteCategoria(id: string, accessToken: string): Promise<void> {
        const response = await fetch(`${API_URL}/api/Categorias/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al eliminar categoría");
        }
    },
};
