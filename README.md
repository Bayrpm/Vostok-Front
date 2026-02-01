# Vostok-Front
Sistema de inventarios - FrontEnd

## 📋 Descripción

Aplicación web moderna para gestión de inventarios construida con React, TypeScript, Vite y Tailwind CSS, siguiendo una arquitectura Feature-First que separa el dominio de negocio de la interfaz de usuario.

## 🏗️ Arquitectura Feature-First

El proyecto está organizado siguiendo el patrón Feature-First, donde cada funcionalidad es autocontenida con sus propios componentes, páginas y lógica de negocio.

```
src/
├── features/           # Funcionalidades por dominio
│   ├── auth/          # Autenticación
│   │   ├── pages/     # Páginas de login, registro, etc.
│   │   └── components/ # Componentes específicos de auth
│   ├── inventory/     # Gestión de inventario
│   │   ├── pages/     # Páginas de inventario
│   │   └── components/ # Componentes de productos
│   └── movements/     # Movimientos de inventario
│       ├── pages/     # Páginas de movimientos
│       └── components/ # Componentes de movimientos
├── components/        # Componentes UI compartidos
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── index.ts
├── layouts/           # Layouts de la aplicación
│   ├── Auth/          # Layout para autenticación
│   └── Dashboard/     # Layout para dashboard
├── services/          # Servicios y APIs
│   └── api.ts         # Cliente base Axios configurado
├── models/            # Tipos e interfaces TypeScript
│   └── index.ts       # Product, Movement, etc.
├── hooks/             # Custom hooks
│   └── useFetch.ts    # Hook genérico para fetch
├── utils/             # Utilidades y helpers
│   └── index.ts       # Funciones de formato, debounce, etc.
├── context/           # Context API de React
│   └── AuthContext.tsx # Contexto de autenticación
├── router/            # Configuración de rutas
│   └── index.tsx      # React Router setup
└── main.tsx           # Entry point
```

## 🚀 Comandos

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo en `http://localhost:5173`

### Build
```bash
npm run build
```
Compila el proyecto para producción en `dist/`

### Preview
```bash
npm run preview
```
Previsualiza la build de producción localmente

### Linting
```bash
npm run lint
```
Ejecuta ESLint para verificar el código

## 🛠️ Stack Tecnológico

- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP
- **ESLint** - Linter de código

## 📦 Características Implementadas

### ✅ Componentes UI
- Button con variantes (primary, secondary, danger)
- Input con etiquetas y validación de errores
- Card para contenedores de contenido

### ✅ Features
- **Auth**: Login con autenticación básica
- **Inventory**: CRUD de productos con tabla y formularios
- **Movements**: Visualización de movimientos de inventario

### ✅ Layouts
- AuthLayout: Layout minimalista para autenticación
- DashboardLayout: Layout con header, navegación y sidebar

### ✅ Servicios
- API client configurado con interceptores
- Manejo automático de tokens de autenticación
- Redirección en caso de 401 Unauthorized

### ✅ Context
- AuthContext para gestión global de autenticación

### ✅ Utils
- Formateo de fechas y monedas
- Función debounce
- Helper para classNames condicionales

## 🎨 Tailwind CSS

El proyecto usa Tailwind CSS v4 con la configuración estándar. Los estilos globales están en `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 🔧 Path Aliases

El proyecto tiene configurados path aliases para imports más limpios:

```typescript
@components/*  → src/components/*
@features/*    → src/features/*
@layouts/*     → src/layouts/*
@services/*    → src/services/*
@models/*      → src/models/*
@hooks/*       → src/hooks/*
@utils/*       → src/utils/*
@context/*     → src/context/*
@router/*      → src/router/*
```

## 🌐 Variables de Entorno

Copia `.env.example` a `.env` y configura las variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## 📝 Próximos Pasos

- [ ] Integrar con API backend real
- [ ] Agregar tests unitarios y de integración
- [ ] Implementar formularios de registro
- [ ] Añadir manejo de roles y permisos
- [ ] Implementar filtros y búsqueda avanzada
- [ ] Agregar paginación en tablas
- [ ] Implementar notificaciones toast
- [ ] Añadir modo oscuro
- [ ] Optimizar rendimiento con React.memo
- [ ] Agregar documentación de componentes con Storybook

## 👥 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y está bajo la licencia de su propietario.
