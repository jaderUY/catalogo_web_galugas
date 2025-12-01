# Catálogo Web Galugas

Proyecto Node.js con Express dividido en backend (API) y frontend (server-side rendered), gestionado con Yarn Workspaces.

## Estructura

```
catalogo_web_galugas/
├── package.json           # Configuración de Yarn Workspaces
├── client/                # Frontend SSR
│   ├── package.json
│   ├── .env.example
│   └── ...
├── server/                # Backend API
│   ├── package.json
│   ├── .env.example
│   └── ...
```

## Requisitos
- Node.js >= 18
- Yarn >= 1.22
- MySQL local

## Instalación

1. Instala dependencias en todos los subproyectos:

```powershell
yarn install
```

2. Configura las variables de entorno:
- Copia y edita los archivos `.env.example` de `client` y `server`.
- Renómbralos a `.env` y ajusta los valores según tu entorno local.

3. Levanta el backend:

```powershell
cd server
yarn dev
```

4. Levanta el frontend:

```powershell
cd ../client
yarn dev
```

## Variables de entorno

Ejemplo para `server/.env.example`:
```
NODE_ENV=development
PORT=3000
SESSION_SECRET=galugas-server-super-secret-key-change-in-production
CLIENT_URL=http://localhost:3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=galugas_db
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

Ejemplo para `client/.env.example`:
```
NODE_ENV=development
CLIENT_PORT=3001
SESSION_SECRET=galugas-client-super-secret-key-change-in-production
API_URL=http://localhost:3000/api
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/uploads
```

## Dependencias principales (unificadas)

- express: ^4.18.2
- ejs: ^3.1.9 (solo client)
- express-session: ^1.17.3
- connect-flash: ^0.1.1
- axios: ^1.6.2 (solo client)
- multer: ^1.4.5
- dotenv: ^16.3.1
- cors: ^2.8.5 (solo server)
- helmet: ^7.1.0 (solo server)
- express-rate-limit: ^7.1.5 (solo server)
- mysql2: ^3.6.5 (solo server)
- bcryptjs: ^2.4.3 (solo server)
- nodemon: ^3.0.1

## Yarn Workspaces

La raíz contiene la configuración para workspaces. Instala dependencias y ejecuta scripts en cada subproyecto:

```powershell
yarn workspace galugas-server dev
yarn workspace galugas-client dev
```

## Scripts útiles
- `yarn dev` (en cada subproyecto): inicia en modo desarrollo con nodemon.
- `yarn start` (en cada subproyecto): inicia en modo producción.

## Notas
- El proyecto está pensado para uso local.
- Los archivos subidos se guardan en la carpeta `uploads` del backend.
- Revisa los puertos y URLs en los `.env` para evitar conflictos.
- Las dependencias están unificadas y declaradas en cada subproyecto para evitar ambigüedades.

---

¿Dudas o problemas? Revisa la documentación interna o contacta al equipo Galugas.
