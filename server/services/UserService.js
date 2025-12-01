import UserModel from '../models/UserModel.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Servicio para la lógica de negocio de usuarios (admin)
 */
export default class UserService {
  constructor() {
    this.userModel = new UserModel();
  }

  /**
   * Obtiene todos los usuarios con filtros
   */
  async getUsuarios(filters = {}) {
    try {
      return await this.userModel.findAllWithRoles(filters);
    } catch (error) {
      throw new AppError(`Error obteniendo usuarios: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUsuarioById(id) {
    const usuario = await this.userModel.findByIdWithRole(id);
    
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Remover contraseña del objeto de respuesta
    const { contrasena, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }

  /**
   * Actualiza un usuario existente
   */
  async updateUsuario(id, userData) {
    const existingUser = await this.userModel.findById(id);
    
    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar si el email ya está en uso por otro usuario
    if (userData.email && userData.email !== existingUser.email) {
      const emailTaken = await this.userModel.isEmailTaken(userData.email, id);
      if (emailTaken) {
        throw new AppError('El email ya está en uso', 400);
      }
    }

    const updated = await this.userModel.update(id, userData);
    
    if (!updated) {
      throw new AppError('Error al actualizar el usuario', 500);
    }

    return { message: 'Usuario actualizado exitosamente' };
  }

  /**
   * Elimina un usuario (soft delete)
   */
  async deleteUsuario(id) {
    const existingUser = await this.userModel.findById(id);
    
    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Prevenir que un usuario se elimine a sí mismo
    // Esta validación se hará en el controlador usando el session user

    const deleted = await this.userModel.delete(id);
    
    if (!deleted) {
      throw new AppError('Error al eliminar el usuario', 500);
    }

    return { message: 'Usuario eliminado exitosamente' };
  }

  /**
   * Actualiza el rol de un usuario
   */
  async updateUserRole(userId, rolId) {
    const existingUser = await this.userModel.findById(userId);
    
    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await this.userModel.update(userId, { rol_id: rolId });
    
    if (!updated) {
      throw new AppError('Error al actualizar el rol del usuario', 500);
    }

    return { message: 'Rol de usuario actualizado exitosamente' };
  }

  /**
   * Actualiza el estado de un usuario
   */
  async updateUserStatus(userId, estadoId) {
    const existingUser = await this.userModel.findById(userId);
    
    if (!existingUser) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const updated = await this.userModel.update(userId, { estado_id: estadoId });
    
    if (!updated) {
      throw new AppError('Error al actualizar el estado del usuario', 500);
    }

    return { message: 'Estado de usuario actualizado exitosamente' };
  }
}