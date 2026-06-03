# Guía Completa del Refactoring - Catálogo Web Galúgas

## 📋 Resumen Ejecutivo

Se ha realizado un refactoring completo del proyecto siguiendo las mejores prácticas de arquitectura de software. Los cambios incluyen la implementación del patrón Repository, simplificación del manejo de errores asincronos y eliminación de redundancia entre JWT y sesiones.

---

## 1️⃣ Implementación del Patrón Repository

### ¿Qué se hizo?

Se creó una **capa de acceso a datos** separada para cada módulo. Ahora los flujos de datos siguen este patrón:

```
HTTP Request → Controller → Service → Repository → Database
```

### Archivos creados

| Módulo    | Archivo                    | Responsabilidad |
|-----------|----------------------------|-----------------|
| auth      | `auth.repository.js`       | Consultas de usuario |
| products  | `product.repository.js`    | CRUD de productos |
| cart      | `cart.repository.js`       | Gestión de carritos |
| orders    | `order.repository.js`      | Operaciones de pedidos |
| reviews   | `review.repository.js`     | Reseñas |
| contact   | `contact.repository.js`    | Mensajes |
| admin     | `admin.repository.js`      | Datos administrativos |

### Ejemplo: Flujo de Autenticación

**Antes:**
```javascript
// auth.controller.js
const { email, password } = req.body;
const [rows] = await pool.query('SELECT ...');  // ❌ SQL directo
```

**Después:**
```javascript
// auth.controller.js
const user = await authService.loginUser(email, password);  // ✅ Limpio

// auth.service.js
const user = await authRepository.getUserByEmail(email);    // ✅ Validación aquí

// auth.repository.js
return await pool.query('SELECT ...');  // ✅ SQL aquí solamente
```

### Beneficios

✅ **Testeable**: Puedes mockear el repositorio en tests unitarios  
✅ **Reutilizable**: Un repositorio puede usarse en múltiples servicios  
✅ **Mantenible**: Cambios en SQL no afectan la lógica de negocio  
✅ **Consistente**: Mismo patrón en todos los módulos  

---

## 2️⃣ Manejo de Errores Asincronos con `express-async-errors`

### ¿Qué se hizo?

**Instaladas nuevas dependencias:**
```bash
npm install express-async-errors express-mysql-session
```

### Cambios en `server.js`

```javascript
const express = require('express');
// ... resto del código
```

### Ejemplo: Simplificación de Controladores

**Antes (con try-catch repetitivo):**
```javascript
const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);  // ❌ Repetido en CADA controlador
  }
};
```

**Después (limpio):**
```javascript
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });  // ✅ Sin try-catch
};
```

Los errores se lanzan directamente desde el servicio y son capturados automáticamente por el middleware global.

### Manejo de Errores Global

El middleware `errorHandler.js` ahora:

```javascript
const errorHandler = (err, req, res, next) => {
  const status = determinaStatusCode(err.message);
  
  // Log detallado
  console.error(err);
  
  // Respuesta consistente
  res.status(status).json({
    success: false,
    status,
    message: err.message,
    stack: isDevelopment ? err.stack : undefined
  });
};
```

### Beneficios

✅ **Menos código**: Sin bloques try-catch repetitivos  
✅ **Consistente**: Todos los errores manejados igual  
✅ **Centralizado**: Un solo punto para lógica de error  
✅ **Tipo-safe**: TypeScript-friendly (si migras)  

---

## 3️⃣ Eliminación de Redundancia JWT ↔ Sessions

### Problema Original

El proyecto usaba **ambas** tecnologías:

```javascript
// ❌ Redundancia innecesaria
res.cookie('token', jwtToken);           // Guardar token en cookie
req.session.userId = user.usuario_id;    // Guardar en sesión
```

Esto duplicaba lógica de autenticación y causaba inconsistencias.

### Solución: Solo Sessions (Nativas con SSR)

Como usas **EJS (Server-Side Rendering)**, las sesiones son la opción más nativa y simple.

### Cambios en `server.js`

**Antes (sesión en memoria):**
```javascript
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // ❌ Sin almacenamiento = sesiones se pierden al reiniciar
}));
```

**Después (persistencia en MySQL):**
```javascript
const MySQLStore = require('express-mysql-session')(session);

const sessionStore = new MySQLStore(
  {
    expiration: 24 * 60 * 60 * 1000,
    createDatabaseTable: true,
    schema: { tableName: 'sessions' }
  },
  pool
);

app.use(session({
  store: sessionStore,  // ✅ Persiste en BD
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'strict' }
}));
```

### Simplificación de Autenticación

**auth.controller.js:**
```javascript
const login = async (req, res) => {
  const user = await authService.loginUser(email, password);
  
  // ✅ Solo sesión
  req.session.userId = user.usuario_id;
  req.session.rolId = user.rol_id;
  req.session.email = user.email;
  
  res.json({ success: true, data: user });
};
```

### Nuevo Middleware: `viewAuth.js`

```javascript
// Para rutas de PÁGINA
const authPages = (req, res, next) => {
  if (req.session?.userId) return next();
  res.redirect('/login');
};

// Para rutas de API
const apiAuth = (req, res, next) => {
  if (req.session?.userId) return next();
  throw new Error('Debe iniciar sesión');  // ✅ Se captura globalmente
};
```

### Beneficios

✅ **Más simple**: Una única mecánica de autenticación  
✅ **Persistente**: Sesiones sobreviven a reinicios  
✅ **Seguro**: httpOnly cookies + sessions  
✅ **Native**: Usa Express.js estándar  

---

## 4️⃣ Actualizaciones de Dependencias

### Instaladas

```json
{
  "express-async-errors": "^3.1.1",
  "express-mysql-session": "^2.1.8"
}
```

### Removidas (Opcional)

```json
{
  "jsonwebtoken": "^9.0.3"  // ❌ Ya no usado en autenticación web
}
```

Puedes mantener `jsonwebtoken` si necesitas generar tokens para APIs externas.

---

## 5️⃣ Cambios en `package.json`

```json
{
  "dependencies": {
    "express-async-errors": "^3.1.1",      // ✨ Nuevo
    "express-mysql-session": "^2.1.8",     // ✨ Nuevo
    // Otros...
  }
}
```

**Importante**: Ejecuta `npm install` para actualizar dependencias.

---

## 6️⃣ Nueva Estructura de Módulos

Cada módulo ahora sigue este patrón:

```
src/server/modules/[modulo]/
│
├── [modulo].repository.js
│   └── Acceso a datos (solo SQL)
│
├── [modulo].service.js
│   └── Lógica de negocio + validaciones
│
├── [modulo].controller.js
│   └── Manejo HTTP (sin try-catch)
│
├── [modulo].routes.js
│   └── Definición de endpoints
│
├── [modulo].validation.js  (opcional)
│   └── Reglas de validación con express-validator
│
└── [modulo].pages.js
    └── Rutas de vistas (SSR)
```

---

## 7️⃣ Ejemplos de Uso

### Crear un Producto

```javascript
// Servicio
const createProduct = async (productData) => {
  const { nombre, precio, stock } = productData;
  
  // Validaciones de negocio
  if (precio <= 0) throw new Error('El precio debe ser mayor a 0');
  if (stock < 0) throw new Error('El stock no puede ser negativo');
  
  // Usar repositorio
  const dispositivo_id = await productRepository.createProduct(productData);
  return { dispositivo_id };
};

// Controlador
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({
    success: true,
    message: 'Producto creado',
    data: product
  });
};
```

### Manejar Errores

```javascript
// Service lanza errores
const getProduct = async (id) => {
  const product = await productRepository.getProductById(id);
  if (!product) throw new Error('Producto no encontrado');  // ✅ Status 404
  return product;
};

// Controlador sin try-catch
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
};

// Middleware global captura y maneja
const errorHandler = (err, req, res, next) => {
  if (err.message.includes('no encontrado')) {
    return res.status(404).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: err.message });
};
```

---

## 8️⃣ Migración de Rutas (Si es necesario)

Si tus rutas necesitan autenticación, úsalas así:

```javascript
// routes.js
const { apiAuth, apiAdminAuth } = require('../../middlewares/viewAuth');

router.get('/profile', apiAuth, controller.getProfile);
router.get('/admin/stats', apiAdminAuth, controller.getDashboard);
```

---

## 9️⃣ Testing

Con esta estructura es mucho más fácil hacer tests:

```javascript
describe('ProductService', () => {
  it('debe validar precio positivo', async () => {
    const mockRepository = {
      createProduct: jest.fn()
    };
    
    await expect(
      createProduct({ nombre: 'Test', precio: -10, stock: 5 })
    ).rejects.toThrow('El precio debe ser mayor a 0');
  });
});
```

---

## 🔟 Checklist de Verificación

- [ ] Ejecutar `npm install` para actualizar dependencias
- [ ] Verificar que la tabla `sessions` se crea automáticamente en MySQL
- [ ] Hacer login y verificar que la sesión persiste
- [ ] Reiniciar el servidor y verificar que la sesión sigue activa
- [ ] Crear/actualizar un producto y verificar que no hay errores
- [ ] Revisar logs en `process.env.NODE_ENV === 'development'`

---

## 📚 Recursos Adicionales

- [Express Async Errors](https://github.com/davidbanham/express-async-errors)
- [Express MySQL Session](https://github.com/expressjs/session)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## ❓ Preguntas Frecuentes

### ¿Aún puedo usar JWT?
Sí, si necesitas APIs móviles o externas, puedes tener:
- Sessions para SSR web
- JWT para APIs externas

### ¿Qué pasa con sesiones viejas al actualizarse el código?
La tabla `sessions` maneja expiración automática. Las sesiones viejas se limpian según `expiration`.

### ¿Necesito hacer cambios en las vistas?
No, las vistas siguen funcionando igual. `res.locals.user` sigue disponible.

### ¿Cómo migro datos de tests antiguos?
Los tests ahora pueden mockearse a nivel de repositorio sin necesidad de BD real.

---

## 🎉 ¡Refactoring Completado!

El proyecto ahora tiene:
- ✅ Arquitectura clara y escalable
- ✅ Manejo de errores centralizado
- ✅ Autenticación simple y consistente
- ✅ Código más limpio y testeable
- ✅ Sesiones persistentes en BD

**Próximos pasos sugeridos:**
1. Escribir tests unitarios con Jest
2. Documentar APIs con Swagger
3. Agregar logs más detallados
4. Implementar caching
5. Migrar a TypeScript (opcional)
