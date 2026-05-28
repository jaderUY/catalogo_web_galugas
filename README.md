# Catálogo Web Galúgas - Documentación Técnica

**Plataforma de E-commerce para la venta de dispositivos electrónicos**

---

## Tabla de Contenidos

- [Catálogo Web Galúgas - Documentación Técnica](#catálogo-web-galúgas---documentación-técnica)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Descripción General](#descripción-general)
  - [Características Principales](#características-principales)
    - [Para Usuarios](#para-usuarios)
    - [Para Administradores](#para-administradores)
    - [Seguridad](#seguridad)
  - [Requisitos Previos](#requisitos-previos)
  - [Instalación y Configuración](#instalación-y-configuración)
    - [1. Clonar el Repositorio](#1-clonar-el-repositorio)
    - [2. Instalar Dependencias](#2-instalar-dependencias)
    - [3. Configurar Variables de Entorno](#3-configurar-variables-de-entorno)
    - [4. Configurar Base de Datos](#4-configurar-base-de-datos)
    - [5. Iniciar el Servidor](#5-iniciar-el-servidor)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
    - [Backend](#backend)
    - [Frontend](#frontend)
    - [Desarrollo](#desarrollo)
  - [Documentación Adicional](#documentación-adicional)
    - [Guías Disponibles](#guías-disponibles)
  - [Seguridad](#seguridad-1)
  - [Reportar Problemas](#reportar-problemas)
  - [Soporte](#soporte)
  - [Licencia](#licencia)

---

## Descripción General

**Catálogo Web Galúgas** es una aplicación web full-stack de e-commerce diseñada para la compra y venta de dispositivos electrónicos. La aplicación proporciona una experiencia completa con:

- Catálogo dinámico de productos
- Carrito de compras funcional
- Sistema de pedidos y seguimiento
- Sistema de reseñas y calificaciones
- Gestión de usuarios y autenticación
- Panel administrativo para gestión de inventario
- Sistema de contacto y notificaciones por email

**Versión:** 1.0.0  
**Autor:** jaderUY <jaderdavidaraujoarboleda@gmail.com>  
**Licencia:** MIT

---

## Características Principales

### Para Usuarios
- Registro e inicio de sesión seguro
- Búsqueda y filtrado avanzado de productos
- Gestión del carrito de compras
- Checkout seguro con procesamiento de pedidos
- Historial de compras
- Sistema de reseñas y calificaciones
- Perfil de usuario editable
- Formulario de contacto

### Para Administradores
- CRUD completo de productos
- Gestión de categorías y marcas
- Control de inventario
- Gestión de usuarios y roles
- Panel de administración

### Seguridad
- Autenticación con JWT y Sessions
- Encriptación de contraseñas (bcryptjs)
- Protección contra XSS
- Headers HTTP seguros (Helmet)
- Rate limiting en endpoints críticos
- Validación de entrada en todos los endpoints

---

## Requisitos Previos

- **Node.js:** v14.0.0 o superior
- **npm:** v6.0.0 o superior
- **MySQL:** v5.7 o superior
- **Git:** para control de versiones

---

## Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/jaderUY/catalogo_web_galugas.git
cd catalogo_web_galugas
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# PUERTO
PORT=3000

# ENTORNO
NODE_ENV=development

# BASE DE DATOS
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=catalogo_web_galugas

# SEGURIDAD
SESSION_SECRET=tu_secreto_de_sesion_muy_seguro
JWT_SECRET=tu_secreto_jwt_muy_seguro
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
SESSION_MAX_AGE=604800000

# CORREO
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_app
MAIL_FROM=contacto@galugas.com

# RATE LIMITING
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# NODE ENVIRONMENT
NODE_ENV=development
```

### 4. Configurar Base de Datos

Consultar [`docs/DATABASE.md`](./DATABASE.md) para:
- Schema de tablas
- Scripts de inicialización
- Relaciones entre tablas

### 5. Iniciar el Servidor

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm run start
```

El servidor estará disponible en: `http://localhost:3000`

---

## Estructura del Proyecto

```
catalogo_web_galugas/
├── docs/                           # Documentación técnica
│   ├── README.md                   # Este archivo
│   ├── ARCHITECTURE.md             # Arquitectura del sistema
│   ├── API_DOCUMENTATION.md        # Endpoints API
│   ├── DATABASE.md                 # Esquema de BD
│   ├── SETUP.md                    # Guía de instalación detallada
│   └── DEVELOPMENT_GUIDE.md        # Guía para desarrolladores
│
├── src/
│   ├── client/                     # Frontend (Vistas EJS, CSS, JavaScript)
│   │   ├── assets/
│   │   │   ├── css/                # Estilos globales y específicos
│   │   │   │   ├── global.css
│   │   │   │   ├── auth.css
│   │   │   │   ├── cart.css
│   │   │   │   ├── products.css
│   │   │   │   ├── orders.css
│   │   │   │   └── ...
│   │   │   └── images/             # Imágenes estáticas
│   │   │
│   │   ├── modules/                # Módulos del cliente
│   │   │   ├── auth/
│   │   │   │   ├── scripts/
│   │   │   │   │   └── auth.client.js
│   │   │   │   └── views/
│   │   │   │       ├── login.ejs
│   │   │   │       └── register.ejs
│   │   │   ├── products/
│   │   │   ├── cart/
│   │   │   ├── orders/
│   │   │   ├── admin/
│   │   │   ├── reviews/
│   │   │   └── contact/
│   │   │
│   │   ├── partials/               # Templates reutilizables
│   │   │   ├── header.ejs
│   │   │   ├── navbar.ejs
│   │   │   └── footer.ejs
│   │   │
│   │   └── utils/
│   │       └── client-helpers.js   # Utilidades del cliente
│   │
│   └── server/                     # Backend (API y lógica de negocio)
│       ├── config/
│       │   ├── db.js               # Configuración de BD
│       │   └── env.js              # Variables de entorno
│       │
│       ├── middlewares/            # Middlewares Express
│       │   ├── auth.middleware.js  # Autenticación JWT
│       │   ├── security.js         # Seguridad (Helmet, XSS, Rate Limiting)
│       │   ├── validate.middleware.js
│       │   ├── errorHandler.js     # Manejo de errores
│       │   ├── notFound.js         # Ruta 404
│       │   └── viewAuth.js         # Autenticación para vistas
│       │
│       ├── modules/                # Módulos de negocio (MVC)
│       │   ├── auth/
│       │   │   ├── auth.routes.js
│       │   │   ├── auth.controller.js
│       │   │   ├── auth.service.js
│       │   │   ├── auth.validation.js
│       │   │   └── auth.pages.js
│       │   │
│       │   ├── products/
│       │   ├── cart/
│       │   ├── orders/
│       │   ├── reviews/
│       │   ├── contact/
│       │   └── admin/
│       │
│       └── utils/                  # Utilidades del servidor
│           ├── jwt.js              # Token JWT
│           ├── hash.js             # Bcrypt password
│           ├── mailer.js           # Envío de emails
│           └── slugify.js          # Normalización de URLs
│
├── package.json                    # Dependencias del proyecto
├── server.js                       # Punto de entrada
├── .env                            # Variables de entorno (no incluir en git)
├── .gitignore                      # Archivos ignorados por git
└── README.md                       # Información general (este archivo)
```

---

## Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|----------|
| **Express.js** | ^4.19.2 | Framework web |
| **MySQL2** | ^3.22.3 | Base de datos |
| **express-session** | ^1.19.0 | Gestión de sesiones |
| **jsonwebtoken** | ^9.0.3 | Autenticación JWT |
| **bcryptjs** | ^3.0.3 | Encriptación de contraseñas |
| **express-validator** | ^7.3.2 | Validación de datos |
| **Helmet** | ^7.2.0 | Seguridad HTTP |
| **express-rate-limit** | ^7.2.0 | Rate limiting |
| **xss** | ^1.0.14 | Protección XSS |
| **nodemailer** | ^8.0.7 | Envío de emails |
| **morgan** | ^1.10.1 | Logging HTTP |
| **dotenv** | ^17.4.2 | Variables de entorno |

### Frontend
| Tecnología | Propósito |
|------------|----------|
| **EJS** | Template engine |
| **HTML5** | Estructura |
| **CSS3** | Estilos |
| **JavaScript ES6+** | Interactividad |
| **Bootstrap** | Framework CSS |

### Desarrollo
| Herramienta | Propósito |
|------------|----------|
| **Node.js** | Runtime JavaScript |
| **npm** | Gestor de paquetes |
| **Nodemon** | Recarga automática |
| **Jest** | Testing (opcional) |
| **Git** | Control de versiones |

---

## Documentación Adicional

### Guías Disponibles

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Descripción detallada de la arquitectura
   - Patrones de diseño
   - Flujo de solicitudes
   - Estructura de módulos

2. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
   - Endpoints disponibles
   - Parámetros y respuestas
   - Códigos de estado
   - Ejemplos de uso

3. **[DATABASE.md](./DATABASE.md)**
   - Esquema de base de datos
   - Descripción de tablas
   - Relaciones
   - Scripts de inicialización

4. **[SETUP.md](./SETUP.md)**
   - Instalación paso a paso
   - Configuración del entorno
   - Troubleshooting común
   - Despliegue

5. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)**
   - Convenciones de código
   - Workflow de desarrollo
   - Creación de nuevos módulos
   - Testing
   - Best practices

---

## Seguridad

La aplicación implementa múltiples capas de seguridad:

- **Autenticación:** JWT + Sessions
- **Encriptación:** bcryptjs para contraseñas
- **Headers HTTP:** Helmet para protección adicional
- **Validación:** express-validator en todos los endpoints
- **Sanitización:** Limpieza automática de entrada XSS
- **Rate Limiting:** Protección contra ataques de fuerza bruta
- **CORS:** Configurado para orígenes autorizados

---

## Reportar Problemas

Para reportar bugs o sugerir mejoras:

1. Crear un issue en el repositorio
2. Incluir descripción detallada del problema
3. Proporcionar pasos para reproducirlo
4. Adjuntar capturas de pantalla si es relevante

---

## Soporte

Para consultas o soporte:
- **Email:** jaderdavidaraujoarboleda@gmail.com
- **Issues:** Crear un issue en el repositorio

---

## Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo `LICENSE` para más detalles.

---

**Última actualización:** Mayo 2026  
**Estado:** En desarrollo activo
