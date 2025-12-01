import AuthService from '../services/AuthService.js';
import LogService from '../services/LogService.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Controlador para autenticación
 */
export default class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.logService = new LogService();
  }

  /**
   * Inicia sesión de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await this.authService.authenticate(email, password);
      
      // Establecer sesión
      req.session.user = user;
      req.session.isAuthenticated = true;

      // Log de inicio de sesión
      await this.logService.registrarActividad({
        usuario_id: user.usuario_id,
        tipo_usuario: user.rol_nombre,
        accion: 'INICIO_SESION',
        modulo: 'AUTENTICACION',
        descripcion: `Inició sesión en el sistema`,
        metadata: { user_agent: req.get('User-Agent') }
      }, req);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Log de intento fallido
      await this.logService.registrarActividadSistema(
        'ERROR_AUTENTICACION',
        'AUTENTICACION',
        `Intento fallido de inicio de sesión para email: ${req.body.email}`,
        { ip: req.ip, user_agent: req.get('User-Agent') }
      );

      next(error);
    }
  };

  /**
   * Cierra sesión de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  logout = async (req, res, next) => {
    try {
      const user = req.session.user;

      req.session.destroy((err) => {
        if (err) {
          throw new AppError('Error al cerrar sesión', 500);
        }
        
        // Log de cierre de sesión
        if (user) {
          this.logService.registrarActividad({
            usuario_id: user.usuario_id,
            tipo_usuario: user.rol_nombre,
            accion: 'CIERRE_SESION',
            modulo: 'AUTENTICACION',
            descripcion: `Cerró sesión del sistema`
          }, req);
        }

        res.json({
          success: true,
          message: 'Logout exitoso',
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verifica la sesión actual
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  getCurrentUser = async (req, res, next) => {
    try {
      if (!req.session.user) {
        throw new AppError('No hay sesión activa', 401);
      }

      const user = await this.authService.getUserById(req.session.user.usuario_id);
      
      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verifica si el usuario es administrador
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  checkAdmin = async (req, res, next) => {
    try {
      if (!req.session.user) {
        throw new AppError('No autorizado', 401);
      }

      const isAdmin = await this.authService.isAdmin(req.session.user.usuario_id);
      
      res.json({
        success: true,
        isAdmin: isAdmin,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Registra un nuevo usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  register = async (req, res, next) => {
    try {
      const userData = {
        ...req.body,
        rol_id: 2, // Cliente por defecto
        estado_id: 1 // Activo
      };

      const user = await this.authService.createUser(userData);

      // Log de registro
      await this.logService.registrarActividadSistema(
        'REGISTRO_USUARIO',
        'AUTENTICACION',
        `Nuevo usuario registrado: ${user.email}`,
        { usuario_id: user.id, email: user.email }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Actualiza perfil de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  updateProfile = async (req, res, next) => {
    try {
      const userId = req.session.user.usuario_id;
      const user = await this.authService.updateUser(userId, req.body);

      // Log de actualización
      await this.logService.registrarActividad({
        usuario_id: userId,
        tipo_usuario: req.session.user.rol_nombre,
        accion: 'ACTUALIZACION_PERFIL',
        modulo: 'USUARIOS',
        descripcion: `Actualizó su perfil`,
        metadata: { campos_actualizados: Object.keys(req.body) }
      }, req);

      // Actualizar sesión
      req.session.user = { ...req.session.user, ...user };

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: user,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cambia contraseña de usuario
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  changePassword = async (req, res, next) => {
    try {
      const userId = req.session.user.usuario_id;
      const { currentPassword, newPassword } = req.body;

      await this.authService.changePassword(userId, currentPassword, newPassword);

      // Log de cambio de contraseña
      await this.logService.registrarActividad({
        usuario_id: userId,
        tipo_usuario: req.session.user.rol_nombre,
        accion: 'CAMBIO_CONTRASENA',
        modulo: 'AUTENTICACION',
        descripcion: `Cambió su contraseña`
      }, req);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  };
}