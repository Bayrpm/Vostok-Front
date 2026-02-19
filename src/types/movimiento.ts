// Basado en la respuesta del backend para movimientos de inventario
// tipoMovimiento puede ser:
// "INGRESO MANUAL", "ANULACION_INGRESO MANUAL", "TRANSFERENCIA_ENTRADA", "TRANSFERENCIA_SALIDA", "INVENTARIO INICIAL", etc.
export type MovimientoInventario = {
    id: string;
    fechaMovimiento: string;
    tipoMovimiento: string;
    direccion: string;
    direccionNombre: string;
    cantidad: number;
    costoUnitario: number | null;
    valorTotal: number;
    documentoReferencia: string | null;
    documentoTipo: string | null;
    motivo: string | null;
    productoNombre: string;
    sku: string;
    almacenNombre: string;
    usuarioNombre: string;
    fechaCreacion: string;
};
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