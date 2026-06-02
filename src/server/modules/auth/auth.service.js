// modules/auth/auth.service.js
const authRepository = require('./auth.repository');
const { hashPassword, comparePassword } = require('../../utils/hash');

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @throws {Error} Si el email ya existe o hay error en la BD
 */
const registerUser = async (userData) => {
  const { email, password, ...userInfo } = userData;

  // Verificar que el email no exista
  const existingUser = await authRepository.getUserByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Hash de la contraseña
  const hashedPassword = await hashPassword(password);

  // Crear usuario
  const usuario_id = await authRepository.createUser({
    ...userInfo,
    email,
    hashedPassword
  });

  return { usuario_id };
};

/**
 * Autentica un usuario con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Object} Datos del usuario autenticado
 * @throws {Error} Si las credenciales son inválidas
 */
const loginUser = async (email, password) => {
  // Obtener usuario por email
  const user = await authRepository.getUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  // Verificar contraseña
  const isMatch = await comparePassword(password, user.contraseña);
  if (!isMatch) {
    throw new Error('Credenciales inválidas');
  }

  return {
    usuario_id: user.usuario_id,
    rol_id: user.rol_id,
    email: user.direccionEmail
  };
};

/**
 * Obtiene el perfil completo de un usuario
 * @param {number} usuario_id - ID del usuario
 * @returns {Object} Perfil del usuario
 * @throws {Error} Si el usuario no existe
 */
const getUserProfile = async (usuario_id) => {
  const profile = await authRepository.getUserProfile(usuario_id);
  if (!profile) {
    throw new Error('Usuario no encontrado');
  }
  return profile;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};