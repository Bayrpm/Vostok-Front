const API_URL = import.meta.env.VITE_API_URL;

export type TipoComprobante = {
    id: string;
    codigo: number;
    nombre: string;
    afectaStock: boolean;
};

export const tipoComprobanteService = {
    /**
     * GET /api/tipo-comprobantes
     * Obtiene la lista de tipos de comprobantes disponibles
     */
    async getTiposComprobantes(accessToken: string): Promise<TipoComprobante[]> {
        const response = await fetch(`${API_URL}/api/TipoComprobantes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Error al obtener tipos de comprobantes"
            );
        }

        const result = await response.json();
        // Mapear respuesta a nuestro tipo
        // El backend puede devolver datos en result.data o directamente como array
        const tipos = Array.isArray(result) ? result : (result.data || []);

        return tipos.map((tipo: Record<string, unknown>) => ({
            id: (tipo.Id || tipo.id) as string,
            codigo: (tipo.Codigo || tipo.codigo) as number,
            nombre: (tipo.Nombre || tipo.nombre) as string,
            afectaStock: (tipo.AfectaStock || tipo.afectaStock) as boolean,
        }));
    },
};
