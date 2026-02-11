# Guía para Crear Métodos en Servicios

Esta guía explica paso a paso cómo crear nuevos métodos en los servicios de la aplicación, siguiendo las mejores prácticas y el formato estándar utilizado en el proyecto.

## 📋 Requisitos Previos

- Conocimiento básico de TypeScript
- Familiaridad con la estructura del proyecto
- Entendimiento de las APIs REST del backend .NET

## 🚀 Proceso Paso a Paso

### Paso 1: Crear el Tipo de Datos (Type)

**Ubicación**: `src/types/[entidad].ts`

Antes de crear cualquier método en un servicio, **SIEMPRE** debes crear primero el tipo de datos que representará la información que se enviará o recibirá.

#### 1.1 Definir el Payload de Creación

```typescript
// Ejemplo: src/types/producto.ts
export type CreateProductoPayload = {
  Nombre: string;
  CodigoBarras: string;
};
```

**Reglas para el nombre del tipo:**

- `Create[Entidad]Payload` - Para operaciones de creación
- `Update[Entidad]Payload` - Para operaciones de actualización
- `[Entidad]Response` - Para respuestas de la API

#### 1.2 Definir otros tipos necesarios

```typescript
export type ProductoFilters = {
  nombre?: string;
  categoriaId?: string;
  activo?: boolean;
};

export type ProductoListResponse = {
  productos: Producto[];
  total: number;
  pagina: number;
  limite: number;
};
```

### Paso 2: Crear el Método en el Servicio

**Ubicación**: `src/services/[entidad]Service.ts`

#### 2.1 Estructura básica del servicio

```typescript
// src/services/productosService.ts
import type { CreateProductoPayload, ProductoFilters } from "@/types/producto";

const API_URL = import.meta.env.VITE_API_URL;

export const productosService = {
  // Métodos del servicio aquí
};
```

#### 2.2 Crear método POST (Creación)

```typescript
async createProducto(
    data: CreateProductoPayload,
    accessToken: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar producto");
    }
}
```

#### 2.3 Crear método GET (Obtener uno)

```typescript
async getProductoById(
    id: string,
    accessToken: string,
): Promise<Producto> {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener producto");
    }

    return await response.json();
}
```

#### 2.4 Crear método GET (Obtener lista con filtros)

```typescript
async getProductos(
    filters: ProductoFilters,
    accessToken: string,
): Promise<Producto[]> {
    const queryParams = new URLSearchParams();

    if (filters.nombre) queryParams.append('nombre', filters.nombre);
    if (filters.categoriaId) queryParams.append('categoriaId', filters.categoriaId);
    if (filters.activo !== undefined) queryParams.append('activo', filters.activo.toString());

    const url = `${API_URL}/api/productos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener productos");
    }

    return await response.json();
}
```

#### 2.5 Crear método PUT (Actualización)

```typescript
async updateProducto(
    id: string,
    data: UpdateProductoPayload,
    accessToken: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar producto");
    }
}
```

#### 2.6 Crear método DELETE

```typescript
async deleteProducto(
    id: string,
    accessToken: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar producto");
    }
}
```

### Paso 3: Usar el Servicio en Componentes

**Ubicación**: `src/components/[entidad]/[Componente].tsx` o `src/pages/[Entidad].tsx`

#### 3.1 Importar el servicio y tipos

```typescript
import { productosService } from "@/services/productosService";
import { useAuth } from "@/contexts/AuthContext";
import type { CreateProductoPayload } from "@/types/producto";
```

#### 3.2 Obtener el token de autenticación

```typescript
const { session } = useAuth();
const accessToken = session?.access_token || "";
```

#### 3.3 Usar el servicio en una mutación (React Query)

```typescript
const createMutation = useMutation({
  mutationFn: async (data: CreateProductoPayload) => {
    await productosService.createProducto(data, accessToken);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["productos"] });
    toast({ title: "Producto creado exitosamente" });
  },
  onError: (error: Error) => {
    toast({
      variant: "destructive",
      title: "Error",
      description: error.message,
    });
  },
});
```

#### 3.4 Usar el servicio en una query (React Query)

```typescript
const { data: productos, isLoading } = useQuery({
  queryKey: ["productos", filters],
  queryFn: async () => {
    return await productosService.getProductos(filters, accessToken);
  },
});
```

## 📝 Documentación del Método

Cada método debe estar documentado con JSDoc:

````typescript
/**
 * POST /api/productos
 * Crea un nuevo producto
 *
 * @param data - Payload con los datos del producto a crear
 * @param data.Nombre - Nombre del producto (requerido)
 * @param data.CodigoBarras - Código de barras del producto
 * @param accessToken - Token de autenticación Bearer
 * @returns Promise<void>
 *
 * @example
 * ```typescript
 * await productosService.createProducto({
 *     Nombre: "Producto de ejemplo",
 *     CodigoBarras: "123456789"
 * }, accessToken);
 * ```
 */
async createProducto(
    data: CreateProductoPayload,
    accessToken: string,
): Promise<void> {
    // implementación
}
````

## ✅ Checklist de Validación

Antes de finalizar, verifica:

- [ ] **Tipo creado**: ¿Existe el tipo correspondiente en `src/types/[entidad].ts`?
- [ ] **Servicio actualizado**: ¿El método está en `src/services/[entidad]Service.ts`?
- [ ] **Imports correctos**: ¿Se importan los tipos necesarios?
- [ ] **Token de auth**: ¿Se pasa el `accessToken` correctamente?
- [ ] **Manejo de errores**: ¿Se manejan los errores del backend?
- [ ] **Documentación**: ¿El método está documentado con JSDoc?
- [ ] **Compilación**: ¿No hay errores de TypeScript?
- [ ] **Componente actualizado**: ¿Se usa el servicio en el componente correspondiente?

## 🔧 Ejemplo Completo

### 1. Tipo en `src/types/producto.ts`

```typescript
export type CreateProductoPayload = {
  Nombre: string;
  CodigoBarras: string;
};
```

### 2. Servicio en `src/services/productosService.ts`

```typescript
async createProducto(
    data: CreateProductoPayload,
    accessToken: string,
): Promise<void> {
    const response = await fetch(`${API_URL}/api/productos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al guardar producto");
    }
}
```

### 3. Uso en componente

```typescript
const { session } = useAuth();

const mutation = useMutation({
  mutationFn: async (data: CreateProductoPayload) => {
    await productosService.createProducto(data, session?.access_token || "");
  },
  // ... resto de configuración
});
```

## 🚨 Errores Comunes a Evitar

1. **No crear el tipo primero**: Siempre crea el tipo antes del método
2. **Olvidar el accessToken**: Todos los métodos necesitan autenticación
3. **No manejar errores**: Siempre verifica `response.ok` y lanza errores
4. **Imports incorrectos**: Importa tipos desde `@/types/[entidad]`
5. **Nombres inconsistentes**: Sigue el patrón `create[Entidad]`, `get[Entidad]`, etc.
6. **No invalidar queries**: Después de mutaciones, invalida las queries relevantes

## 📚 Referencias

- Consulta `categoriaService.ts` como ejemplo de implementación completa
- Revisa `productoService.ts` para ver el formato actual
- Los tipos base están en `src/integrations/supabase/types.ts`</content>
  <parameter name="filePath">d:\Proyecto inventario\Proyectos\Vostok-Front\GUIA_SERVICIOS.md
