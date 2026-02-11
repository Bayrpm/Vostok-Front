export type ProductoEmpresa = {
    id: string;
    productoId: string;
    productoNombre: string;
    categoriaId: string;
    categoriaNombre: string;
    sku: string;
    precio: number;
    activo: boolean;
}

export type CreateProductoEmpresaPayload = {
    productoId: string;
    categoriaId: string;
    sku: string;
    precio: number;
}

export type UpdateProductoEmpresaPayload = {
    id: string;
    categoriaId: string;
    sku: string;
    precio: number;
}

export type DeleteProductoEmpresaPayload = {
    id: string;
}