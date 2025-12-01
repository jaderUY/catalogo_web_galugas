import UserService from '../services/UserService.js';
import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para gestión de usuarios (admin)
 */
export default class UserController {
  constructor() {
    this.userService = new UserService();
    this.logService = new LogService();
  }

  /**
   * Obtiene todos los usuarios
   */
  getUsuarios = async (req, res, next) => {
    try {
      const usuarios = await this.userService.getUsuarios(req.query);
      
      res.json({
        success: true,
        data: usuarios,
        count: usuarios.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Obtiene un usuario por ID
   */
  getUsuarioById = async (req, res, next) => {
    try {
      const usuario = await this.userService.getUsuarioById(parseInt(req.params.id));
      
      res.json({
        success: true,
        data: usuario,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza un usuario
   */
  updateUsuario = async (req, res, next) => {
    try {
      const result = await this.userService.updateUsuario(parseInt(req.params.id), req.body);
      
      // Log de actualización
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'USUARIOS',
        `Actualizó usuario ID: ${req.params.id}`,
        req,
        { usuario_id: parseInt(req.params.id), campos_actualizados: Object.keys(req.body) }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Elimina un usuario (soft delete)
   */
  deleteUsuario = async (req, res, next) => {
    try {
      const result = await this.userService.deleteUsuario(parseInt(req.params.id));
      
      // Log de eliminación
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ELIMINACION',
        'USUARIOS',
        `Eliminó usuario ID: ${req.params.id}`,
        req,
        { usuario_id: parseInt(req.params.id) }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza el rol de un usuario
   */
  updateUserRole = async (req, res, next) => {
    try {
      const { rol_id } = req.body;
      
      if (!rol_id) {
        throw new AppError('El ID del rol es requerido', 400);
      }

      const result = await this.userService.updateUserRole(parseInt(req.params.id), parseInt(rol_id));
      
      // Log de cambio de rol
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'USUARIOS',
        `Cambió rol del usuario ID: ${req.params.id} a rol ID: ${rol_id}`,
        req,
        { usuario_id: parseInt(req.params.id), nuevo_rol_id: rol_id }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza el estado de un usuario
   */
  updateUserStatus = async (req, res, next) => {
    try {
      const { estado_id } = req.body;
      
      if (!estado_id) {
        throw new AppError('El ID del estado es requerido', 400);
      }

      const result = await this.userService.updateUserStatus(parseInt(req.params.id), parseInt(estado_id));
      
      // Log de cambio de estado
      await this.logService.registrarActividadAdmin(
        req.session.user,
        'ACTUALIZACION',
        'USUARIOS',
        `Cambió estado del usuario ID: ${req.params.id} a estado ID: ${estado_id}`,
        req,
        { usuario_id: parseInt(req.params.id), nuevo_estado_id: estado_id }
      );

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };
}