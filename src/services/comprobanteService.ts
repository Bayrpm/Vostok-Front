import type {
    CrearComprobanteDTO,
} from "@/types/comprobante";

const API_URL = import.meta.env.VITE_API_URL;

export const comprobanteService = {
    /**
     * POST /api/Comprobantes
     * Crea un nuevo comprobante en estado BORRADOR
     * 
     * Transforma los datos del formulario (camelCase) al formato esperado por el backend (PascalCase)
     */
    async createComprobante(
        data: {
            tipoComprobanteCodigo?: string;
            numero?: string;
            fecha?: string;
            observacion?: string;
            detalles?: Array<{
                productoEmpresaId?: string;
                cantidad?: number;
                almacenOrigenId?: string;
                almacenDestinoId?: string;
            }>;
        },
        accessToken: string
    ): Promise<void> {
        // Convertir tipoComprobanteCodigo a número
        const tipoCodigoNum = parseInt(data.tipoComprobanteCodigo || "0");

        // Transformar datos del formulario al formato esperado por el backend
        const payload = {
            TipoComprobanteCodigo: tipoCodigoNum,
            Numero: data.numero || "",
            Fecha: data.fecha ? new Date(data.fecha).toISOString() : new Date().toISOString(),
            Observacion: data.observacion || undefined,
            Detalles: (data.detalles || []).map((detalle) => ({
                ProductoEmpresaId: detalle.productoEmpresaId || "",
                Cantidad: detalle.cantidad || 0,
                AlmacenOrigenId: detalle.almacenOrigenId || undefined,
                AlmacenDestinoId: detalle.almacenDestinoId || undefined,
            })),
        };

        const response = await fetch(`${API_URL}/api/Comprobantes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            try {
                const errorData = JSON.parse(text);
                // Si hay errores de validación
                if (errorData.errors) {
                    const errorMessages = Object.values(errorData.errors)
                        .flat()
                        .join(", ");
                    throw new Error(errorMessages || "Error de validación");
                }
                throw new Error(
                    errorData.message || "Error al crear el comprobante"
                );
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error("Error al crear el comprobante");
            }
        }

        const text = await response.text();
        if (!text) {
            throw new Error("El servidor no devolvió una respuesta válida");
        }
        const result = JSON.parse(text);
        // No devolvemos nada, solo confirmamos que fue creado exitosamente
    },

    /**
     * GET /api/comprobantes
     * Obtiene la lista de comprobantes
     */
    async getComprobantes(accessToken: string): Promise<Record<string, unknown>[]> {
        const response = await fetch(`${API_URL}/api/Comprobantes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Error al obtener comprobantes"
            );
        }

        const result = await response.json();
        return result.data || [];
    },

    /**
     * GET /api/Comprobantes/:id
     * Obtiene un comprobante específico por ID
     */
    async getComprobante(
        id: string,
        accessToken: string
    ): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/api/Comprobantes/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "Error al obtener el comprobante"
            );
        }

        const result = await response.json();
        return result.data;
    },

    /**
     * GET /api/Comprobantes/numero/:numero
     * Obtiene un comprobante específico por número
     */
    async getComprobanteByNumero(
        numero: string,
        accessToken: string
    ): Promise<Record<string, unknown>> {
        const response = await fetch(`${API_URL}/api/Comprobantes/numero/${encodeURIComponent(numero)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                errorData.message || "No se encontró el comprobante"
            );
        }

        const result = await response.json();
        return result.data || result;
    },

    /**
     * PUT /api/Comprobantes/:id/confirmar
     * Confirma un comprobante (cambia estado de BORRADOR a CONFIRMADO)
     */
    async confirmarComprobante(
        id: string,
        accessToken: string
    ): Promise<void> {
        const response = await fetch(`${API_URL}/api/Comprobantes/${id}/confirmar`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            try {
                const errorData = JSON.parse(text);
                throw new Error(
                    errorData.message || "Error al confirmar el comprobante"
                );
            } catch (e) {
                if (e instanceof Error) {
                    throw e;
                }
                throw new Error("Error al confirmar el comprobante");
            }
        }
    },

    /**
     * GET /api/tipo-comprobantes
     * Obtiene los tipos de comprobantes disponibles
     */
    async getTiposComprobantes(accessToken: string): Promise<Array<{
        codigo: string;
        nombre: string;
    }>> {
        const response = await fetch(`${API_URL}/api/tipo-comprobantes`, {
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
        return result.data || [];
    },
};
