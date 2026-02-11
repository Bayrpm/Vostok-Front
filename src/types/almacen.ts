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

export type CreateAlmacenPayload = {
    empresaId: string;
    nombre: string;
    descripcion?: string;
    esPrincipal?: boolean;
    codigo: string;
};
export type UpdateAlmacenPayload = {
    nombre?: string;
    descripcion?: string;
    esPrincipal?: boolean;
    activo?: boolean;
    codigo?: string;
};

export type GetAlmacenPayload = {
    id: string;
}

export type DeleteAlmacenPayload = {
    id: string;
}