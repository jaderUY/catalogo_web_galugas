import { AppError } from '../utils/ErrorHandler.js';
import AuthService from '../services/AuthService.js';

const authService = new AuthService();

/**
 * Middleware de autenticación
 */
export class AuthMiddleware {
  /**
   * Verifica si el usuario está autenticado
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  requireAuth = (req, res, next) => {
    if (!req.session.user) {
      return next(new AppError('Acceso no autorizado. Por favor inicie sesión.', 401));
    }
    next();
  };

  /**
   * Verifica si el usuario es administrador
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  requireAdmin = async (req, res, next) => {
    try {
      if (!req.session.user) {
        return next(new AppError('Acceso no autorizado', 401));
      }

      const isAdmin = await authService.isAdmin(req.session.user.usuario_id);
      
      if (!isAdmin) {
        return next(new AppError('Se requieren privilegios de administrador', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verifica si el usuario es vendedor o administrador
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  requireVendedor = async (req, res, next) => {
    try {
      if (!req.session.user) {
        return next(new AppError('Acceso no autorizado', 401));
      }

      const isVendedor = await authService.isVendedor(req.session.user.usuario_id);
      
      if (!isVendedor) {
        return next(new AppError('Se requieren privilegios de vendedor', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Middleware para inyectar información de usuario en las respuestas
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  injectUserData = (req, res, next) => {
    // Hacer disponible el usuario en todas las respuestas
    if (req.session.user) {
      res.locals.user = req.session.user;
      res.locals.isAuthenticated = true;
      res.locals.isAdmin = req.session.user.rol_nombre === 'Administrador';
      res.locals.isVendedor = ['Administrador', 'Vendedor'].includes(req.session.user.rol_nombre);
    } else {
      res.locals.user = null;
      res.locals.isAuthenticated = false;
      res.locals.isAdmin = false;
      res.locals.isVendedor = false;
    }
    next();
  };

  /**
   * Verifica si el usuario puede acceder a su propio recurso o es admin
   * @param {string} resourceIdParam - Nombre del parámetro que contiene el ID del recurso
   * @returns {Function} Middleware function
   */
  canAccessOwnResource = (resourceIdParam = 'id') => {
    return (req, res, next) => {
      if (!req.session.user) {
        return next(new AppError('Acceso no autorizado', 401));
      }

      const resourceId = parseInt(req.params[resourceIdParam]);
      const userId = req.session.user.usuario_id;

      // Administradores pueden acceder a todo
      if (req.session.user.rol_nombre === 'Administrador') {
        return next();
      }

      // Usuarios solo pueden acceder a sus propios recursos
      if (resourceId === userId) {
        return next();
      }

      return next(new AppError('No tiene permisos para acceder a este recurso', 403));
    };
  };
}

export default new AuthMiddleware();