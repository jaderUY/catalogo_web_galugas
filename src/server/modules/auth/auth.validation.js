// modules/auth/auth.validation.js
const { body } = require('express-validator');

const registerValidation = [
  body('primer_nombre').notEmpty().withMessage('Nombre es requerido'),
  body('primer_apellido').notEmpty().withMessage('Apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('fechaNacimiento').optional().isDate(),
  body('pais_id').optional().isInt()
];

const loginValidation = [
  body('email').isEmail(),
  body('password').notEmpty()
];

module.exports = { registerValidation, loginValidation };