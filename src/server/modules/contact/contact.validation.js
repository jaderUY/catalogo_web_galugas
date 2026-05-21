const { body } = require('express-validator');

const contactValidation = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email no es válido'),
  body('mensaje').notEmpty().withMessage('El mensaje es obligatorio'),
  body('telefono').optional().isString().withMessage('El teléfono debe ser texto válido')
];

module.exports = { contactValidation };