import BaseModel from './BaseModel.js';
import bcrypt from 'bcryptjs';

/**
 * Modelo para la entidad Usuario con autenticación
 * @extends BaseModel
 */
export default class UserModel extends BaseModel {
  constructor() {
    super('Usuario');
  }

  /**
   * Encuentra usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} Usuario encontrado
   */
  async findByEmail(email) {
    const query = `
      SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
      FROM Usuario u 
      LEFT JOIN Rol r ON u.rol_id = r.rol_id 
      WHERE u.email = ? AND u.estado_id = 1
    `;
    
    const result = await this.execute(query, [email]);
    return result[0] || null;
  }

  /**
   * Encuentra usuario por ID con información de rol
   * @param {number} id - ID del usuario
   * @returns {Promise<Object>} Usuario con rol
   */
  async findByIdWithRole(id) {
    const query = `
      SELECT u.*, r.nombre as rol_nombre, r.descripcion as rol_descripcion
      FROM Usuario u 
      LEFT JOIN Rol r ON u.rol_id = r.rol_id 
      WHERE u.usuario_id = ? AND u.estado_id = 1
    `;
    
    const result = await this.execute(query, [id]);
    return result[0] || null;
  }

  /**
   * Crea un nuevo usuario con contraseña encriptada
   * @param {Object} userData - Datos del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async create(userData) {
    if (userData.contrasena) {
      userData.contrasena = await this.hashPassword(userData.contrasena);
    }
    
    return await super.create(userData);
  }

  /**
   * Actualiza un usuario existente
   * @param {number} id - ID del usuario
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó
   */
  async update(id, data) {
    if (data.contrasena) {
      data.contrasena = await this.hashPassword(data.contrasena);
    }
    
    return await super.update(id, data);
  }

  /**
   * Encripta una contraseña
   * @param {string} password - Contraseña a encriptar
   * @returns {Promise<string>} Contraseña encriptada
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica si una contraseña coincide
   * @param {string} password - Contraseña a verificar
   * @param {string} hashedPassword - Contraseña encriptada
   * @returns {Promise<boolean>} True si coinciden
   */
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Actualiza la contraseña de un usuario
   * @param {number} userId - ID del usuario
   * @param {string} newPassword - Nueva contraseña
   * @returns {Promise<boolean>} True si se actualizó
   */
  async updatePassword(userId, newPassword) {
    const hashedPassword = await this.hashPassword(newPassword);
    return await this.update(userId, { contrasena: hashedPassword });
  }

  /**
   * Obtiene todos los usuarios con información de rol
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} Array de usuarios
   */
  async findAllWithRoles(filters = {}) {
    let query = `
      SELECT 
        u.*, 
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion,
        e.nombre as estado_nombre
      FROM Usuario u
      LEFT JOIN Rol r ON u.rol_id = r.rol_id
      LEFT JOIN Estado e ON u.estado_id = e.estado_id
      WHERE 1=1
    `;
    
    const params = [];
    const conditions = [];

    if (filters.rol_id) {
      conditions.push('u.rol_id = ?');
      params.push(parseInt(filters.rol_id));
    }

    if (filters.estado_id) {
      conditions.push('u.estado_id = ?');
      params.push(parseInt(filters.estado_id));
    }

    if (filters.search) {
      conditions.push('(u.primer_nombre LIKE ? OR u.primer_apellido LIKE ? OR u.email LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY u.primer_nombre, u.primer_apellido';

    return await this.execute(query, params);
  }

  /**
   * Verifica si el email ya está en uso
   * @param {string} email - Email a verificar
   * @param {number} excludeUserId - ID de usuario a excluir (para actualizaciones)
   * @returns {Promise<boolean>} True si está en uso
   */
  async isEmailTaken(email, excludeUserId = null) {
    let query = 'SELECT COUNT(*) as count FROM Usuario WHERE email = ?';
    const params = [email];
    
    if (excludeUserId) {
      query += ' AND usuario_id != ?';
      params.push(excludeUserId);
    }
    
    const result = await this.execute(query, params);
    return result[0].count > 0;
  }
}