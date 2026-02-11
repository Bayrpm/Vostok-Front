import type { Tables } from "@/integrations/supabase/types";

export type MovimientoInventario = Tables<"MovimientosInventario">;

export type CreateMovimientoInventarioPayload = {
    EmpresaId: string;
    ProductoEmpresaId: string;
    AlmacenId: string;
    TipoMovimiento: string;
    Direccion: string;
    Cantidad: number;
    UsuarioId: string;
    ComprobanteDetalleId: string;
    CostoUnitario?: number;
    DocumentoReferencia?: string;
    DocumentoTipo?: string;
    Motivo?: string;
    MovimientoRelacionadoId?: string;
};