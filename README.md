# Vostok - Frontend

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

Aplicación web frontend del sistema de gestión de inventarios **Vostok**. Desarrollada en React con TypeScript, consume una API backend en .NET y utiliza Supabase para autenticación.

---

## Stack tecnológico

| Categoría          | Tecnología                          |
| ------------------ | ----------------------------------- |
| Framework          | React 18 + TypeScript               |
| Build tool         | Vite 5 (SWC)                        |
| Estilos            | Tailwind CSS 3.4 + shadcn/ui        |
| Ruteo              | React Router DOM 6                   |
| Estado del servidor| TanStack React Query 5               |
| Formularios        | React Hook Form + Zod               |
| Autenticación      | Supabase Auth (JWT)                  |
| Gráficos           | Recharts                             |
| Testing            | Vitest + React Testing Library       |
| Linting            | ESLint 9 + TypeScript ESLint         |

---

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── layout/          # DashboardLayout, Sidebar
│   ├── almacenes/       # Componentes de almacenes
│   ├── categories/      # Componentes de categorías
│   ├── products/        # Componentes de productos
│   ├── common/          # Componentes utilitarios
│   └── ProtectedRoute.tsx
├── pages/               # Vistas principales
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx
│   ├── Productos.tsx
│   ├── ProductoEmpresa.tsx
│   ├── Categorias.tsx
│   ├── Movimientos.tsx
│   ├── IngresoComprobante.tsx
│   ├── VisualizarComprobante.tsx
│   ├── Almacenes.tsx
│   └── NotFound.tsx
├── services/            # Comunicación con la API backend
├── types/               # Definiciones de tipos TypeScript
├── contexts/            # Context providers (AuthContext)
├── hooks/               # Custom hooks
├── integrations/        # Integración con Supabase
├── lib/                 # Utilidades generales
└── test/                # Archivos de prueba
```

---

## Funcionalidades principales

- **Dashboard** con métricas de inventario, categorías y movimientos recientes.
- **Gestión de productos**: creación, listado y eliminación de productos.
- **Productos por empresa**: administración de inventario por empresa.
- **Categorías**: CRUD de categorías de productos.
- **Almacenes**: gestión de múltiples almacenes.
- **Comprobantes**: creación y visualización de comprobantes de movimiento.
- **Movimientos de inventario**: registro y consulta de entradas y salidas.
- **Autenticación**: login y registro de usuarios con Supabase Auth.
- **Rutas protegidas**: acceso restringido a usuarios autenticados.

---

## Configuración e instalación

### Requisitos previos

- Node.js >= 18
- npm (incluido con Node.js)
- Backend .NET corriendo en `https://localhost:7180` (o la URL configurada)

### Instalación

```bash
git clone https://github.com/Bayrpm/Vostok-Front.git
cd Vostok-Front
npm install
```

### Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=<url_del_proyecto_supabase>
VITE_SUPABASE_PUBLISHABLE_KEY=<clave_publica_supabase>
VITE_API_URL=<url_del_backend>
```

| Variable                         | Descripción                              |
| -------------------------------- | ---------------------------------------- |
| `VITE_SUPABASE_URL`             | URL del proyecto en Supabase             |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon key) de Supabase     |
| `VITE_API_URL`                  | URL base de la API backend (.NET)        |

### Ejecución

```bash
# Modo de desarrollo (puerto 8081)
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview
```

---

## Scripts disponibles

| Script           | Descripción                              |
| ---------------- | ---------------------------------------- |
| `npm run dev`    | Inicia el servidor de desarrollo         |
| `npm run build`  | Genera el build de producción            |
| `npm run build:dev` | Genera el build en modo desarrollo    |
| `npm run lint`   | Ejecuta ESLint                           |
| `npm run preview` | Sirve el build de producción localmente  |
| `npm run test`   | Ejecuta las pruebas con Vitest           |
| `npm run test:watch` | Ejecuta las pruebas en modo watch   |

---

## Flujo general de la aplicación

1. El usuario accede a la aplicación y es redirigido a `/login` si no está autenticado.
2. Tras autenticarse con Supabase Auth, se obtiene un token JWT de sesión.
3. Las rutas protegidas validan la sesión activa antes de renderizar el contenido.
4. Los servicios (`src/services/`) realizan peticiones HTTP al backend .NET usando `fetch`, incluyendo el token de autorización en cada request.
5. El estado del servidor se gestiona con TanStack React Query para caché y sincronización.
6. El dashboard agrega datos de productos, categorías y movimientos recientes.

---

## Estado actual del proyecto

El proyecto se encuentra en desarrollo activo. Las funcionalidades principales de gestión de inventario están implementadas, incluyendo autenticación, CRUD de productos, categorías, almacenes y gestión de comprobantes.
