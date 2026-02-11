export type Producto = {
  id: string;
  nombre: string;
  codigoBarra: string;
  activo: boolean;
};

export type CreateProductoPayload = {
  nombre: string;
  codigoBarra?: string;
};

export type DeleteProductoPayload = {
  id: string;
}