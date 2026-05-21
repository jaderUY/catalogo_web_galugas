const adminService = require('./admin.service');

const handle = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (error) {
    next(error);
  }
};

// Productos
exports.listProducts = handle(async (req, res) => {
  const products = await adminService.getAllProducts();
  res.json(products);
});

exports.createProduct = handle(async (req, res) => {
  const product = await adminService.createProduct(req.body);
  res.status(201).json(product);
});

exports.updateProduct = handle(async (req, res) => {
  const product = await adminService.updateProduct(req.params.id, req.body);
  res.json(product);
});

exports.deleteProduct = handle(async (req, res) => {
  await adminService.deleteProduct(req.params.id);
  res.status(204).send();
});

// Categorías
exports.listCategories = handle(async (req, res) => {
  const [categories] = await adminService.getAllCategories();
  res.json(categories);
});

exports.createCategory = handle(async (req, res) => {
  await adminService.createCategory(req.body.nombre, req.body.descripcion);
  res.status(201).json({ message: 'Categoría creada' });
});

exports.updateCategory = handle(async (req, res) => {
  await adminService.updateCategory(req.params.id, req.body.nombre, req.body.descripcion);
  res.json({ message: 'Categoría actualizada' });
});

exports.deleteCategory = handle(async (req, res) => {
  await adminService.deleteCategory(req.params.id);
  res.status(204).send();
});

// Marcas
exports.listBrands = handle(async (req, res) => {
  const [brands] = await adminService.getAllBrands();
  res.json(brands);
});

exports.createBrand = handle(async (req, res) => {
  await adminService.createBrand(req.body.nombre, req.body.pais_id, req.body.descripcion);
  res.status(201).json({ message: 'Marca creada' });
});

exports.updateBrand = handle(async (req, res) => {
  await adminService.updateBrand(req.params.id, req.body.nombre, req.body.pais_id, req.body.descripcion);
  res.json({ message: 'Marca actualizada' });
});

exports.deleteBrand = handle(async (req, res) => {
  await adminService.deleteBrand(req.params.id);
  res.status(204).send();
});

// Usuarios
exports.listUsers = handle(async (req, res) => {
  const users = await adminService.getAllUsers();
  res.json(users);
});

exports.updateUserRole = handle(async (req, res) => {
  await adminService.updateUserRole(req.params.id, req.body.rol_id);
  res.json({ message: 'Rol actualizado' });
});

exports.deleteUser = handle(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  res.status(204).send();
});

// Inventario
exports.getInventory = handle(async (req, res) => {
  const inventory = await adminService.getInventory();
  res.json(inventory);
});

exports.updateStock = handle(async (req, res) => {
  await adminService.updateStock(req.params.id, req.body.cantidadStock);
  res.json({ message: 'Stock actualizado' });
});