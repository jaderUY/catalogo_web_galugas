# Catálogo Web Galugas

Plataforma de e-commerce moderna con Node.js + Express. Arquitectura monolítica con cliente SSR y servidor API compartiendo un único `package.json` y configuración centralizada.

## Estado del Proyecto

```
Status: Operational
Backend API: Ready
Frontend SSR: Ready
Refactoring: Complete
Documentation: Updated
```

---

## Documentación Importante

### Para nuevos desarrolladores
1. **[UNIFIED_STRUCTURE_GUIDE.md](./UNIFIED_STRUCTURE_GUIDE.md)** - Guía de estructura unificada (START HERE)
2. **[REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md)** - Resumen de cambios recientes
3. **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Estándares del proyecto

### Para contribuyentes
- **[REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)** - Detalles técnicos
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Cómo migrar código
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Estándares de código

---

## Inicio Rápido

### Requisitos
- Node.js >= 18
- MySQL local o remoto
- npm >= 9.0.0

### Instalación

```bash
# Instalar dependencias (una única vez para ambos subproyectos)
npm install
```

### Configuración de Variables de Entorno

Editar el archivo `.env` en la raíz del proyecto:

```env
# Servidor
NODE_ENV=development
SERVER_PORT=3000
CLIENT_PORT=3001

# Base de datos
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=DB_Galugas_web

# Secretos (cambiar en producción)
SERVER_SESSION_SECRET=tu-secreto-aqui
CLIENT_SESSION_SECRET=tu-secreto-aqui
JWT_SECRET=tu-jwt-secreto-aqui
```

### Ejecutar

```bash
# Terminal 1: Servidor (Backend)
npm run server:dev

# Terminal 2: Cliente (Frontend)
npm run client:dev

# O ejecutar ambos simultáneamente
npm run dev
```

---

## Estructura del Proyecto

```
catalogo_web_galugas/
├── package.json          (Unificado para cliente y servidor)
├── .env                  (Configuración centralizada)
├── server/
│   ├── server.js         (Punto de entrada del servidor)
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   └── ...
└── client/
    ├── app.js            (Punto de entrada del cliente)
    ├── config/
    ├── routes/
    ├── views/
    ├── public/
    └── ...
```

---

## Scripts Disponibles

```bash
# Servidor
npm run server          # Ejecutar servidor en producción
npm run server:dev     # Ejecutar servidor en desarrollo (con nodemon)

# Cliente
npm run client         # Ejecutar cliente en producción
npm run client:dev    # Ejecutar cliente en desarrollo (con nodemon)

# Ambos
npm run dev           # Ejecutar cliente y servidor simultáneamente

# Base de datos
npm run setup-db      # Configurar base de datos inicial
npm run seed          # Poblar base de datos con datos de prueba

# Calidad de código
npm run lint          # Ejecutar eslint
npm run format        # Formatear código con prettier
npm run validate:env  # Validar variables de entorno
```

---

## Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Dispositivos
- `GET /api/dispositivos` - Listar (con filtros)
- `GET /api/dispositivos/:id` - Detalle
- `POST /api/dispositivos` - Crear (admin)
- `PUT /api/dispositivos/:id` - Actualizar (admin)
- `DELETE /api/dispositivos/:id` - Eliminar (admin)

### Categorías
- `GET /api/categorias` - Listar
- `POST /api/categorias` - Crear (admin)
- `PUT /api/categorias/:id` - Actualizar (admin)

---

## Seguridad

- Validación de entrada centralizada
- Sanitización contra XSS
- CORS configurado
- Helmet para headers HTTP
- Rate limiting activo
- Contraseñas encriptadas (bcrypt)
- Sesiones seguras (httpOnly, secure)
- Logging de actividades
- Manejo de errores sin exponer detalles

---

## Variables de Entorno

Consulta el archivo `.env` para una descripción completa de todas las variables disponibles. El archivo `.env.example` contiene valores por defecto seguros.

---

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests específicos
npm run test:server   # Solo tests del servidor
npm run test:client   # Solo tests del cliente
```

---

## Cambios Principales (v1.1.0)

- **Unificación de package.json**: Cliente y servidor comparten un único package.json
- **Configuración centralizada**: Un único archivo `.env` para ambos componentes
- **Código profesional**: Eliminación de emojis para aspecto más limpio
- **Scripts mejorados**: Comandos para ejecutar ambos procesos simultáneamente
- **Mejor organización**: Separación clara de responsabilidades

---

## Licencia

MIT

---

**Última actualización**: Diciembre 2024
**Versión**: 1.1.0
**Mantenedor**: Equipo Galugas

