export type CrearComprobanteDTO = {
    tipoComprobanteCodigo: number;
    fecha: string; // YYYY-MM-DD desde el formulario, se convierte a DateTime en el backend
    observacion?: string;
    detalles: CrearComprobanteDetalleDTO[];
};

export type CrearComprobanteDetalleDTO = {
    productoEmpresaId: string; // UUID
    cantidad: number;
    costoUnitario?: number; // Opcional, requerido según tipo de comprobante
    almacenOrigenId?: string; // UUID opcional
    almacenDestinoId?: string; // UUID opcional
};

// Tipos para el backend (PascalCase)
export type CrearComprobanteDTOBackend = {
    TipoComprobanteCodigo: number;
    Fecha: string; // ISO string
    Observacion?: string;
    Detalles: CrearComprobanteDetalleDTOBackend[];
};

export type CrearComprobanteDetalleDTOBackend = {
    ProductoEmpresaId: string; // UUID
    Cantidad: number;
    CostoUnitario?: number | null; // Opcional, requerido según tipo de comprobante
    AlmacenOrigenId?: string | null;
    AlmacenDestinoId?: string | null;
};