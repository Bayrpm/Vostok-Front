export type Categoria = {
    Nombre: string;
    EmpresaId: string;
    Id: string;
    CategoriaPadreId: string | null;
    Activo: boolean;
};

export type CreateCategoriaPayload = {
    Nombre: string;
    CategoriaPadreId?: string | null;
    EmpresaId: string;
};

export type UpdateCategoriaPayload = {
    Nombre?: string;
    CategoriaPadreId?: string | null;
    Activo?: boolean;
};