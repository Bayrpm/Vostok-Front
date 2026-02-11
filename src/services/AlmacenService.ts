import type {
  CreateAlmacenPayload,
  UpdateAlmacenPayload,
  DeleteAlmacenPayload,
} from "@/types/almacen";

const API_URL = import.meta.env.VITE_API_URL;

export type Almacen = {
  id: string;
  empresaId: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  esPrincipal: boolean;
  activo: boolean;
  fechaCreacion: Date;
};

export const almacenService = {
  /**
   * GET /api/almacenes
   * Obtiene la lista de todos los almacenes de la empresa
   */
  async getAlmacenes(accessToken: string): Promise<Almacen[]> {
    const response = await fetch(`${API_URL}/api/almacenes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener almacenes"
      );
    }

    const result = await response.json();
    return result.data || [];
  },

  /**
   * GET /api/almacenes/:id
   * Obtiene un almacén específico por ID
   */
  async getAlmacen(id: string, accessToken: string): Promise<Almacen> {
    const response = await fetch(`${API_URL}/api/almacenes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al obtener el almacén"
      );
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * POST /api/almacenes
   * Crea un nuevo almacén
   */
  async createAlmacen(
    data: CreateAlmacenPayload,
    accessToken: string
  ): Promise<Almacen> {
    const response = await fetch(`${API_URL}/api/almacenes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al crear el almacén"
      );
    }

    const text = await response.text();
    if (!text) {
      throw new Error("El servidor no devolvió una respuesta válida");
    }
    const result = JSON.parse(text);
    return result.data;
  },

  /**
   * PUT /api/almacenes/:id
   * Edita un almacén existente
   */
  async updateAlmacen(
    id: string,
    data: UpdateAlmacenPayload,
    accessToken: string
  ): Promise<Almacen> {
    const response = await fetch(`${API_URL}/api/almacenes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const text = await response.text();
      try {
        const errorData = JSON.parse(text);
        throw new Error(
          errorData.message || "Error al actualizar el almacén"
        );
      } catch {
        throw new Error("Error al actualizar el almacén");
      }
    }

    const text = await response.text();
    if (!text) {
      // Si la respuesta está vacía, devolvemos un objeto con los datos actualizado
      return { id, ...data } as Almacen;
    }
    const result = JSON.parse(text);
    return result.data || ({ id, ...data } as Almacen);
  },

  /**
   * DELETE /api/almacenes/:id
   * Elimina un almacén
   */
  async deleteAlmacen(
    data: DeleteAlmacenPayload,
    accessToken: string
  ): Promise<void> {
    const response = await fetch(`${API_URL}/api/almacenes/${data.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error al eliminar el almacén"
      );
    }
  },
};
