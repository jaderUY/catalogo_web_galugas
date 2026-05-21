const express = require('express');
const router = express.Router();
const ctrl = require('./admin.controller');
const { authMiddleware, isAdmin } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  productCreateValidation,
  productUpdateValidation,
  categoryValidation,
  categoryIdValidation,
  brandValidation,
  brandIdValidation,
  userRoleValidation,
  stockValidation
} = require('./admin.validation');

router.use(authMiddleware, isAdmin);

// Productos
router.get('/products', ctrl.listProducts);
router.post('/products', validate(productCreateValidation), ctrl.createProduct);
router.put('/products/:id', validate(productUpdateValidation), ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Categorías
router.get('/categories', ctrl.listCategories);
router.post('/categories', validate(categoryValidation), ctrl.createCategory);
router.put('/categories/:id', validate([...categoryIdValidation, ...categoryValidation]), ctrl.updateCategory);
router.delete('/categories/:id', validate(categoryIdValidation), ctrl.deleteCategory);

// Marcas
router.get('/brands', ctrl.listBrands);
router.post('/brands', validate(brandValidation), ctrl.createBrand);
router.put('/brands/:id', validate([...brandIdValidation, ...brandValidation]), ctrl.updateBrand);
router.delete('/brands/:id', validate(brandIdValidation), ctrl.deleteBrand);

// Usuarios
router.get('/users', ctrl.listUsers);
router.put('/users/:id/role', validate(userRoleValidation), ctrl.updateUserRole);
router.delete('/users/:id', ctrl.deleteUser);

// Inventario
router.get('/inventory', ctrl.getInventory);
router.put('/inventory/:id', validate(stockValidation), ctrl.updateStock);

module.exports = router;