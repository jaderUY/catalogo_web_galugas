import UserModel from '../models/UserModel.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Servicio para autenticación y autorización
 */
export default class AuthService {
  constructor() {
    this.userModel = new UserModel();
  }

  /**
   * Autentica un usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Usuario autenticado
   */
  async authenticate(email, password) {
    if (!email || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    const user = await this.userModel.findByEmail(email);
    
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isValidPassword = await this.userModel.verifyPassword(password, user.contrasena);
    
    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Remover contraseña del objeto de respuesta
    const { contrasena, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Verifica si un usuario es administrador
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si es administrador
   */
  async isAdmin(userId) {
    const user = await this.userModel.findByIdWithRole(userId);
    return user && user.rol_nombre === 'Administrador';
  }

  /**
   * Verifica si un usuario es vendedor
   * @param {number} userId - ID del usuario
   * @returns {Promise<boolean>} True si es vendedor
   */
  async isVendedor(userId) {
    const user = await this.userModel.findByIdWithRole(userId);
    return user && (user.rol_nombre === 'Vendedor' || user.rol_nombre === 'Administrador');
  }

  /**
   * Obtiene usuario por ID
   * @param {number} userId - ID del usuario
   * @returns {Promise<Object>} Usuario
   */
  async getUserById(userId) {
    const user = await this.userModel.findByIdWithRole(userId);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const { contrasena, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async createUser(userData) {
    // Verificar si ya existe un usuario con ese email
    const existingUser = await this.userModel.findByEmail(userData.email);
    
    if (existingUser) {
      throw new AppError('Ya existe un usuario con ese email', 400);
    }

    // Validar datos requeridos
    this._validateUserData(userData);

    return await this.userModel.create(userData);
  }

  /**
   * Actualiza un usuario existente
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async updateUser(userId, userData) {
    const existingUser = await this.userModel.findById(userId);
    
    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar si el email ya está en uso por otro usuario
    if (userData.email && userData.email !== existingUser.email) {
      const emailTaken = await this.userModel.isEmailTaken(userData.email, userId);
      if (emailTaken) {
        throw new AppError('El email ya está en uso', 400);
      }
    }

    const updated = await this.userModel.update(userId, userData);
    
    if (!updated) {
      throw new AppError('Error al actualizar el usuario', 500);
    }

    return await this.getUserById(userId);
  }

  /**
   * Cambia la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se cambió
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userModel.findById(userId);
    
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isValidPassword = await this.userModel.verifyPassword(currentPassword, user.contrasena);
    
    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    return await this.userModel.updatePassword(userId, newPassword);
  }

  /**
   * Valida los datos del usuario
   * @param {Object} data - Datos a validar
   * @private
   */
  _validateUserData(data) {
    const required = ['primer_nombre', 'primer_apellido', 'email', 'contrasena'];
    const missing = required.filter(field => !data[field]);
    
    if (missing.length > 0) {
      throw new AppError(`Campos requeridos faltantes: ${missing.join(', ')}`, 400);
    }

    if (data.email && !this._isValidEmail(data.email)) {
      throw new AppError('Email inválido', 400);
    }

    if (data.contrasena && data.contrasena.length < 6) {
      throw new AppError('La contraseña debe tener al menos 6 caracteres', 400);
    }
  }

  /**
   * Valida formato de email
   * @param {string} email - Email a validar
   * @returns {boolean} True si es válido
   * @private
   */
  _isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}