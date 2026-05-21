const { body, param } = require('express-validator');

const productCreateValidation = [
  body('nombre').notEmpty().withMessage('El nombre del producto es requerido'),
  body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo'),
  body('marca_id').isInt({ gt: 0 }).withMessage('La marca es obligatoria'),
  body('categoria_id').isInt({ gt: 0 }).withMessage('La categoría es obligatoria'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo'),
  body('slug').optional().isString(),
  body('pathFoto').optional().isString(),
  body('estado_id').optional().isInt({ gt: 0 }),
  body('informacionTecnica_id').optional().isInt({ gt: 0 })
];

const productUpdateValidation = [
  param('id').isInt({ gt: 0 }).withMessage('ID de producto inválido'),
  body('precio').optional().isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo'),
  body('marca_id').optional().isInt({ gt: 0 }).withMessage('La marca debe ser un identificador válido'),
  body('categoria_id').optional().isInt({ gt: 0 }).withMessage('La categoría debe ser un identificador válido'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero no negativo')
];

const categoryValidation = [
  body('nombre').notEmpty().withMessage('El nombre de la categoría es requerido'),
  body('descripcion').optional().isString()
];

const categoryIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('ID de categoría inválido')
];

const brandValidation = [
  body('nombre').notEmpty().withMessage('El nombre de la marca es requerido'),
  body('pais_id').isInt({ gt: 0 }).withMessage('El país es obligatorio'),
  body('descripcion').optional().isString()
];

const brandIdValidation = [
  param('id').isInt({ gt: 0 }).withMessage('ID de marca inválido')
];

const userRoleValidation = [
  param('id').isInt({ gt: 0 }).withMessage('ID de usuario inválido'),
  body('rol_id').isInt({ gt: 0 }).withMessage('El rol debe ser un identificador válido')
];

const stockValidation = [
  param('id').isInt({ gt: 0 }).withMessage('ID de inventario inválido'),
  body('cantidadStock').isInt({ min: 0 }).withMessage('La cantidad de stock debe ser un entero no negativo')
];

module.exports = {
  productCreateValidation,
  productUpdateValidation,
  categoryValidation,
  categoryIdValidation,
  brandValidation,
  brandIdValidation,
  userRoleValidation,
  stockValidation
};