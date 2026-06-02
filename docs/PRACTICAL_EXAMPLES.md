# Ejemplos Prácticos - Nuevo Patrón

## 🎯 Cómo Crear un Nuevo Módulo

Suponiendo que quieres crear un módulo `colors` (colores de dispositivos).

### 1. Crear Repository (`colors.repository.js`)

```javascript
// modules/colors/colors.repository.js
const pool = require('../../config/db');

/**
 * Obtiene todos los colores
 */
const getColors = async () => {
  const [rows] = await pool.query('SELECT * FROM color');
  return rows;
};

/**
 * Obtiene un color por ID
 */
const getColorById = async (color_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM color WHERE color_id = ?',
    [color_id]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo color
 */
const createColor = async (colorData) => {
  const { nombre, codigo_hex } = colorData;
  const [result] = await pool.query(
    'INSERT INTO color (nombre, codigo_hex) VALUES (?, ?)',
    [nombre, codigo_hex]
  );
  return result.insertId;
};

/**
 * Actualiza un color
 */
const updateColor = async (color_id, colorData) => {
  await pool.query(
    'UPDATE color SET ? WHERE color_id = ?',
    [colorData, color_id]
  );
};

/**
 * Elimina un color
 */
const deleteColor = async (color_id) => {
  await pool.query('DELETE FROM color WHERE color_id = ?', [color_id]);
};

module.exports = {
  getColors,
  getColorById,
  createColor,
  updateColor,
  deleteColor
};
```

### 2. Crear Service (`colors.service.js`)

```javascript
// modules/colors/colors.service.js
const colorRepository = require('./colors.repository');

/**
 * Obtiene todos los colores
 */
const getAllColors = async () => {
  const colors = await colorRepository.getColors();
  return colors;
};

/**
 * Obtiene un color por ID
 */
const getColor = async (color_id) => {
  const color = await colorRepository.getColorById(color_id);
  if (!color) {
    throw new Error('Color no encontrado');
  }
  return color;
};

/**
 * Crea un nuevo color con validaciones
 */
const createColor = async (colorData) => {
  const { nombre, codigo_hex } = colorData;

  // Validar nombre
  if (!nombre || nombre.trim() === '') {
    throw new Error('El nombre del color es requerido');
  }

  // Validar código hex
  if (!codigo_hex || !/^#[0-9A-F]{6}$/i.test(codigo_hex)) {
    throw new Error('Código hexadecimal inválido. Formato: #RRGGBB');
  }

  const color_id = await colorRepository.createColor({
    nombre: nombre.trim(),
    codigo_hex: codigo_hex.toUpperCase()
  });

  return { color_id };
};

/**
 * Actualiza un color
 */
const updateColor = async (color_id, colorData) => {
  const existing = await colorRepository.getColorById(color_id);
  if (!existing) {
    throw new Error('Color no encontrado');
  }

  // Validaciones
  if (colorData.codigo_hex && !/^#[0-9A-F]{6}$/i.test(colorData.codigo_hex)) {
    throw new Error('Código hexadecimal inválido');
  }

  await colorRepository.updateColor(color_id, colorData);
};

/**
 * Elimina un color
 */
const deleteColor = async (color_id) => {
  const existing = await colorRepository.getColorById(color_id);
  if (!existing) {
    throw new Error('Color no encontrado');
  }

  await colorRepository.deleteColor(color_id);
};

module.exports = {
  getAllColors,
  getColor,
  createColor,
  updateColor,
  deleteColor
};
```

### 3. Crear Controller (`colors.controller.js`)

```javascript
// modules/colors/colors.controller.js
const colorService = require('./colors.service');

const getColors = async (req, res) => {
  const colors = await colorService.getAllColors();
  res.json({
    success: true,
    data: colors
  });
};

const getColor = async (req, res) => {
  const color = await colorService.getColor(req.params.color_id);
  res.json({
    success: true,
    data: color
  });
};

const createColor = async (req, res) => {
  const color = await colorService.createColor(req.body);
  res.status(201).json({
    success: true,
    message: 'Color creado exitosamente',
    data: color
  });
};

const updateColor = async (req, res) => {
  await colorService.updateColor(req.params.color_id, req.body);
  res.json({
    success: true,
    message: 'Color actualizado exitosamente'
  });
};

const deleteColor = async (req, res) => {
  await colorService.deleteColor(req.params.color_id);
  res.json({
    success: true,
    message: 'Color eliminado exitosamente'
  });
};

module.exports = {
  getColors,
  getColor,
  createColor,
  updateColor,
  deleteColor
};
```

### 4. Crear Routes (`colors.routes.js`)

```javascript
// modules/colors/colors.routes.js
const express = require('express');
const { apiAdminAuth } = require('../../middlewares/viewAuth');
const colorController = require('./colors.controller');

const router = express.Router();

// Públicas
router.get('/', colorController.getColors);
router.get('/:color_id', colorController.getColor);

// Admin
router.post('/', apiAdminAuth, colorController.createColor);
router.put('/:color_id', apiAdminAuth, colorController.updateColor);
router.delete('/:color_id', apiAdminAuth, colorController.deleteColor);

module.exports = router;
```

### 5. Registrar en `server.js`

```javascript
// server.js
const colorRoutes = require('./src/server/modules/colors/colors.routes');

// Agregar con los otros módulos
app.use('/api/colors', colorRoutes);
```

### ✨ Resultado

Ahora tienes un módulo completo con:
- ✅ Separación de responsabilidades
- ✅ Validaciones en service
- ✅ Manejo de errores automático
- ✅ Endpoints: GET /api/colors, POST, PUT, DELETE

---

## 🔍 Ejemplos de Uso en Controladores

### ✅ Respuesta de Éxito

```javascript
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  
  res.json({
    success: true,
    data: product,
    message: 'Producto obtenido'  // Opcional
  });
};
```

### ✅ Crear Recurso

```javascript
const createProduct = async (req, res) => {
  const product = await productService.createProduct(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Producto creado',
    data: product
  });
};
```

### ✅ Lanzar Error (Manejado Globalmente)

```javascript
const deleteProduct = async (req, res) => {
  // ✅ Sin try-catch, error se captura automáticamente
  await productService.deleteProduct(req.params.id);
  
  res.json({
    success: true,
    message: 'Producto eliminado'
  });
};
```

### ✅ Error Custom

```javascript
const getProduct = async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  // Si no existe, service lanza: throw new Error('Producto no encontrado')
  // El middleware errorHandler detecta "no encontrado" → status 404
  
  res.json({ success: true, data: product });
};
```

---

## 📧 Ejemplo: Mejorar Servicio de Contacto

### Antes (acoplado)
```javascript
const saveContact = async (nombre, email, mensaje) => {
  const [res] = await pool.query(
    'INSERT INTO contacto (nombre, email, mensaje) VALUES (?, ?, ?)',
    [nombre, email, mensaje]
  );
  
  // Email enviado sin validación
  await sendEmail(process.env.ADMIN_EMAIL, 'Contacto', mensaje);
  
  return { contacto_id: res.insertId };
};
```

### Después (limpio y escalable)
```javascript
// Repository
const createContact = async (contactData) => {
  const [result] = await pool.query(
    'INSERT INTO contacto (nombre, email, asunto, mensaje, usuario_id, fecha) VALUES (?, ?, ?, ?, ?, NOW())',
    [contactData.nombre, contactData.email, contactData.asunto, contactData.mensaje, contactData.usuario_id]
  );
  return result.insertId;
};

// Service con lógica
const saveContact = async (contactData) => {
  const { nombre, email, asunto, mensaje } = contactData;
  
  // Validaciones
  if (!email.includes('@')) throw new Error('Email inválido');
  if (mensaje.length < 10) throw new Error('Mensaje muy corto');
  
  // Guardar
  const contacto_id = await contactRepository.createContact(contactData);
  
  // Enviar email (no bloquea si falla)
  try {
    await mailer.send(process.env.ADMIN_EMAIL, 'Nuevo contacto', mensaje);
  } catch (err) {
    console.error('Error enviando email:', err);
    // El contacto se guardó igual
  }
  
  return { contacto_id };
};

// Controller limpio
const submitContact = async (req, res) => {
  const result = await contactService.saveContact(req.body);
  res.status(201).json({ success: true, data: result });
};
```

---

## 🧪 Testing con el Nuevo Patrón

### Antes (difícil de testear)
```javascript
// test.js
describe('saveContact', () => {
  it('debe guardar contacto', async () => {
    const result = await contactService.saveContact('Juan', 'juan@test.com', 'Mensaje');
    // Necesita BD real ❌
  });
});
```

### Después (fácil de mockear)
```javascript
// test.js
describe('contactService.saveContact', () => {
  it('debe validar email', async () => {
    const mockRepository = {
      createContact: jest.fn()
    };
    
    await expect(
      saveContact({ nombre: 'Juan', email: 'invalid', mensaje: 'Test' })
    ).rejects.toThrow('Email inválido');
    
    expect(mockRepository.createContact).not.toHaveBeenCalled();  // ✅ No se guardó
  });

  it('debe guardar contacto válido', async () => {
    const mockRepository = {
      createContact: jest.fn().mockResolvedValue(123)
    };
    
    const result = await saveContact({
      nombre: 'Juan',
      email: 'juan@test.com',
      mensaje: 'Mensaje válido',
      usuario_id: null
    });
    
    expect(result.contacto_id).toBe(123);
    expect(mockRepository.createContact).toHaveBeenCalled();  // ✅ Se guardó
  });
});
```

---

## 🚨 Manejo de Errores

### Automático (Express Async Errors)

```javascript
const getProduct = async (req, res) => {
  // ✅ Sin try-catch
  const product = await productService.getProductById(req.params.id);
  // Si service lanza error, express-async-errors lo captura automáticamente
  res.json({ success: true, data: product });
};
```

### Errores con Status Específicos

```javascript
// Service
const getProduct = async (id) => {
  if (!id) throw new Error('ID requerido');  // 400
  
  const product = await productRepository.getProductById(id);
  if (!product) throw new Error('Producto no encontrado');  // 404
  
  if (!product.disponible) throw new Error('No tienes permiso');  // 403
  
  return product;
};

// errorHandler detecta automáticamente:
// - "requerido" → 400
// - "no encontrado" → 404
// - "permiso" → 403
```

---

## 📱 Ejemplo: Flujo Completo de Compra

```javascript
// checkoutController.js
const checkout = async (req, res) => {
  // 1. Obtener carrito (sin try-catch)
  const cartItems = await cartService.getCart(req.user.usuario_id);
  
  // 2. Validar (automáticamente)
  // Si está vacío → cartService lanza error → errorHandler lo captura
  
  // 3. Crear orden
  const order = await orderService.createOrder(req.user.usuario_id);
  
  // 4. Limpiar carrito (dentro de orderService)
  
  // 5. Responder
  res.status(201).json({
    success: true,
    message: 'Orden creada',
    data: {
      pedido_id: order.pedido_id,
      total: order.total,
      items: order.itemsCount
    }
  });
};
```

---

## ✅ Ventajas del Nuevo Patrón

1. **Sin try-catch repetitivo** ✅
2. **Fácil de testear** ✅
3. **Errores centralizados** ✅
4. **Reutilizable** ✅
5. **Escalable** ✅
6. **Tipo-safe (si migras a TypeScript)** ✅
7. **Sesiones persistentes** ✅
8. **Autenticación simplificada** ✅

¡Disfruta del nuevo arquitecto refactorizado! 🚀
