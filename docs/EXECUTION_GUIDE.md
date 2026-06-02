# 🚀 Guía de Ejecución y Verificación

## 📦 Paso 1: Instalar Dependencias

```bash
cd d:\PROJECTs\WEB_3.0\catalogo_web_galugas
npm install
```

**Qué se instala:**
- `express-async-errors` - Captura errores en async/await
- `express-mysql-session` - Persistencia de sesiones en MySQL

---

## 🔍 Paso 2: Verificar Configuración

### Archivo `.env`

Asegurate que tienes:

```env
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tucontraseña
DB_NAME=catalogo_galugas

# Sessions
SESSION_SECRET=tu_sesion_secreta_aqui
SESSION_MAX_AGE=86400000  # 24 horas en ms

# Email (opcional)
ADMIN_EMAIL=admin@example.com
```

**Importante:** `SESSION_SECRET` debe ser una cadena larga y aleatoria.

---

## ▶️ Paso 3: Iniciar el Servidor

### Modo Desarrollo

```bash
npm run dev
```

**Esperado:**
```
✅ Servidor corriendo en http://localhost:3000
📊 Environment: development
💾 Sesiones persistidas en MySQL
```

### Modo Producción

```bash
NODE_ENV=production npm start
```

---

## ✅ Paso 4: Verificación

### 1️⃣ Verificar Tabla de Sesiones

```bash
# En MySQL
USE catalogo_galugas;
DESCRIBE sessions;
```

**Esperado:** Tabla con columnas `session_id`, `expires`, `data`

```sql
+----+----------+-------+------+-----+---------+-------+
| Field      | Type   | Null | Key | Default | Extra |
+----+----------+-------+------+-----+---------+-------+
| session_id | varchar(255) | NO | PRI | | |
| expires    | bigint       | YES  | | | |
| data       | longtext     | YES  | | | |
+----+----------+-------+------+-----+---------+-------+
```

### 2️⃣ Probar Autenticación

#### Register (Crear cuenta)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "primer_nombre": "Juan",
    "primer_apellido": "Pérez",
    "email": "juan@test.com",
    "password": "Test1234!",
    "fechaNacimiento": "1990-01-01",
    "direccionResidencia": "Calle Principal 123",
    "pais_id": 1
  }'
```

**Esperado:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": { "usuario_id": 1 }
}
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "juan@test.com",
    "password": "Test1234!"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "message": "Sesión iniciada exitosamente",
  "data": {
    "usuario_id": 1,
    "rol_id": 2,
    "email": "juan@test.com"
  }
}
```

**Importante:** Se establece cookie de sesión automáticamente.

#### Obtener Perfil (con sesión)

```bash
curl http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

**Esperado:**
```json
{
  "success": true,
  "data": {
    "usuario_id": 1,
    "primer_nombre": "Juan",
    "email": "juan@test.com",
    ...
  }
}
```

#### Sin Sesión (debe fallar)

```bash
curl http://localhost:3000/api/auth/profile
```

**Esperado:**
```json
{
  "success": false,
  "status": 401,
  "message": "Debe iniciar sesión para acceder a este recurso"
}
```

### 3️⃣ Probar Productos

#### Listar Productos

```bash
curl http://localhost:3000/api/products
```

**Esperado:**
```json
{
  "success": true,
  "data": [
    {
      "dispositivo_id": 1,
      "nombre": "iPhone 15",
      "precio": 999.99,
      "marca": "Apple",
      "categoria": "Smartphones",
      ...
    }
  ]
}
```

#### Obtener Producto No Existente (error 404)

```bash
curl http://localhost:3000/api/products/999
```

**Esperado:**
```json
{
  "success": false,
  "status": 404,
  "message": "Producto no encontrado"
}
```

### 4️⃣ Probar Carrito

#### Agregar al Carrito (requiere sesión)

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "dispositivo_id": 1,
    "cantidad": 2
  }'
```

**Esperado:**
```json
{
  "success": true,
  "message": "Producto agregado al carrito"
}
```

#### Sin Sesión (debe fallar)

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivo_id": 1,
    "cantidad": 2
  }'
```

**Esperado:**
```json
{
  "success": false,
  "status": 401,
  "message": "Debe iniciar sesión para acceder a este recurso"
}
```

### 5️⃣ Probar Manejo de Errores

#### Contacto con Email Inválido

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "email": "invalid",
    "asunto": "Test",
    "mensaje": "Mensaje de prueba"
  }'
```

**Esperado:**
```json
{
  "success": false,
  "status": 400,
  "message": "Email inválido"
}
```

#### Contacto Válido

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "email": "juan@test.com",
    "asunto": "Consulta",
    "mensaje": "Este es un mensaje de prueba"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente",
  "data": { "contacto_id": 1 }
}
```

---

## 🔄 Paso 5: Verificar Persistencia de Sesiones

### 1️⃣ Hacer Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "juan@test.com", "password": "Test1234!"}'
```

Guarda la cookie en `cookies.txt`

### 2️⃣ Verificar en Base de Datos

```sql
SELECT session_id, expires FROM sessions;
```

**Esperado:** Hay una fila con tu sesión activa

### 3️⃣ Reiniciar el Servidor

```bash
# Presiona Ctrl+C para detener
# Luego reinicia
npm run dev
```

### 4️⃣ Usar la Cookie Anterior

```bash
curl http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

**Esperado:** ✅ La sesión sigue activa (¡persiste!)

### 5️⃣ En Base de Datos

```sql
SELECT session_id, expires FROM sessions;
```

**Esperado:** La misma sesión sigue ahí

---

## 📊 Paso 6: Monitorear Logs

### En Desarrollo

El servidor muestra logs detallados:

```
[timestamp] POST /api/auth/login
[timestamp] GET /api/products
[timestamp] POST /api/cart
```

### Errores

Cuando hay un error:

```
❌ ERROR: {
  "timestamp": "2024-06-02T...",
  "status": 400,
  "message": "Email inválido",
  "path": "/api/contact",
  "method": "POST",
  "stack": ["at validateEmail...", ...]
}
```

### En Producción

Los logs son más simples (sin stack trace):

```
[2024-06-02T10:30:45Z] 400 POST /api/contact - Email inválido
```

---

## 🧪 Paso 7: Tests Avanzados

### Crear Producto (Admin)

```bash
# Primero registra un admin (rol_id = 1)
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "nombre": "Samsung Galaxy",
    "precio": 799.99,
    "marca_id": 2,
    "categoria_id": 1,
    "estado_id": 1,
    "stock": 50,
    "pathFoto": "/images/samsung.jpg",
    "fechaLanzamiento": "2024-01-01"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": { "dispositivo_id": 5 }
}
```

### Sin Rol Admin (debe fallar)

Como usuario normal, intentar crear producto:

```bash
# Error: No tienes permiso
{
  "success": false,
  "status": 403,
  "message": "Se requiere rol de administrador para acceder a este recurso"
}
```

---

## 🐛 Resolución de Problemas

### Error: "express-async-errors no está instalado"

```bash
npm install express-async-errors
```

### Error: "Table 'sessions' doesn't exist"

Reinicia el servidor. `express-mysql-session` la crea automáticamente.

### Error: "SESSION_SECRET is undefined"

Verifica que `.env` tiene `SESSION_SECRET` configurado.

### Las sesiones no persisten

1. Verifica que MySQL está funcionando
2. Verifica tabla `sessions` existe: `SHOW TABLES;`
3. Verifica credenciales de BD en `.env`

### Errores "500" sin contexto

Asegúrate que:
- `require('express-async-errors')` está al inicio de `server.js`
- `errorHandler` es el último middleware

---

## 📈 Checklist Final

- [ ] `npm install` completado sin errores
- [ ] Servidor inicia en puerto 3000
- [ ] Tabla `sessions` creada en MySQL
- [ ] Puedo registrar usuario
- [ ] Puedo hacer login
- [ ] Sesión persiste después de reiniciar servidor
- [ ] Errores retornan JSON con status correcto
- [ ] Acceso sin sesión retorna 401
- [ ] Acceso sin admin retorna 403
- [ ] Logs se muestran en consola

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| No puedo hacer login | Verifica email/password en BD |
| Sesión no persiste | Verifica tabla `sessions` existe |
| Error 500 en todos lados | Revisa imports en server.js |
| Errores no se capturan | Verifica errorHandler es último middleware |
| No puedo crear producto | Verifica si eres admin (rol_id=1) |

---

¡Estás listo para usar el nuevo refactoring! 🎉
