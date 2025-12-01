import BaseModel from './BaseModel.js';

/**
 * Modelo para la entidad Dispositivo
 * @extends BaseModel
 */
export default class DispositivoModel extends BaseModel {
  constructor() {
    super('Dispositivo');
  }

  /**
   * Encuentra todos los dispositivos con información relacionada
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<Array>} Array de dispositivos
   */
  async findAllWithDetails(filters = {}) {
    let query = `
      SELECT 
        d.*, 
        m.nombre as marca_nombre, 
        m.descripcion as marca_descripcion,
        c.nombre as categoria_nombre,
        c.descripcion as categoria_descripcion,
        it.procesador, it.ram_gb, it.almacenamiento, it.resolucion,
        it.dimensiones, it.potencia, it.puertos, it.conectividad, it.version, it.otros,
        e.nombre as estado_nombre,
        (SELECT COUNT(*) FROM Resena r WHERE r.dispositivo_id = d.dispositivo_id) as total_resenas,
        (SELECT AVG(calificacion) FROM Resena r WHERE r.dispositivo_id = d.dispositivo_id) as promedio_calificacion
      FROM Dispositivo d
      LEFT JOIN Marca m ON d.marca_id = m.marca_id
      LEFT JOIN Categoria c ON d.categoria_id = c.categoria_id
      LEFT JOIN InformacionTecnica it ON d.informacionTecnica_id = it.informacionTecnica_id
      LEFT JOIN Estado e ON d.estado_id = e.estado_id
      WHERE 1=1
    `;
    
    const params = [];
    const conditions = [];

    // Aplicar filtros
    if (filters.categoria_id) {
      conditions.push('d.categoria_id = ?');
      params.push(parseInt(filters.categoria_id));
    }

    if (filters.marca_id) {
      conditions.push('d.marca_id = ?');
      params.push(parseInt(filters.marca_id));
    }

    if (filters.estado_id) {
      conditions.push('d.estado_id = ?');
      params.push(parseInt(filters.estado_id));
    } else {
      conditions.push('d.estado_id = 1'); // Solo activos por defecto
    }

    if (filters.minPrice) {
      conditions.push('d.precio >= ?');
      params.push(parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      conditions.push('d.precio <= ?');
      params.push(parseFloat(filters.maxPrice));
    }

    if (filters.search) {
      conditions.push('(d.nombre LIKE ? OR m.nombre LIKE ? OR c.nombre LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    // Ordenamiento
    const orderBy = filters.orderBy || 'd.nombre';
    const orderDirection = filters.orderDirection || 'ASC';
    query += ` ORDER BY ${orderBy} ${orderDirection}`;

    // Paginación
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    return await this.execute(query, params);
  }

  /**
   * Encuentra un dispositivo por ID con información completa
   * @param {number} id - ID del dispositivo
   * @returns {Promise<Object>} Dispositivo con detalles
   */
  async findByIdWithDetails(id) {
    const query = `
      SELECT 
        d.*, 
        m.nombre as marca_nombre, 
        m.descripcion as marca_descripcion,
        m.pais_id as marca_pais_id,
        c.nombre as categoria_nombre,
        c.descripcion as categoria_descripcion,
        it.*,
        e.nombre as estado_nombre
      FROM Dispositivo d
      LEFT JOIN Marca m ON d.marca_id = m.marca_id
      LEFT JOIN Categoria c ON d.categoria_id = c.categoria_id
      LEFT JOIN InformacionTecnica it ON d.informacionTecnica_id = it.informacionTecnica_id
      LEFT JOIN Estado e ON d.estado_id = e.estado_id
      WHERE d.dispositivo_id = ? AND d.estado_id = 1
    `;
    
    const result = await this.execute(query, [id]);
    return result[0] || null;
  }

  /**
   * Obtiene dispositivos por categoría
   * @param {string} categoria - Nombre de la categoría
   * @returns {Promise<Array>} Array de dispositivos
   */
  async findByCategoria(categoria) {
    const query = `
      SELECT d.*, m.nombre as marca_nombre, c.nombre as categoria_nombre
      FROM Dispositivo d
      LEFT JOIN Categoria c ON d.categoria_id = c.categoria_id
      LEFT JOIN Marca m ON d.marca_id = m.marca_id
      WHERE c.nombre = ? AND d.estado_id = 1
    `;
    
    return await this.execute(query, [categoria]);
  }

  /**
   * Obtiene dispositivos por marca
   * @param {string} marca - Nombre de la marca
   * @returns {Promise<Array>} Array de dispositivos
   */
  async findByMarca(marca) {
    const query = `
      SELECT d.*, m.nombre as marca_nombre, c.nombre as categoria_nombre
      FROM Dispositivo d
      LEFT JOIN Marca m ON d.marca_id = m.marca_id
      LEFT JOIN Categoria c ON d.categoria_id = c.categoria_id
      WHERE m.nombre = ? AND d.estado_id = 1
    `;
    
    return await this.execute(query, [marca]);
  }

  /**
   * Actualiza la imagen de un dispositivo
   * @param {number} id - ID del dispositivo
   * @param {string} imagePath - Ruta de la imagen
   * @returns {Promise<boolean>} True si se actualizó
   */
  async updateImage(id, imagePath) {
    return await this.update(id, { pathFoto: imagePath });
  }

  /**
   * Obtiene estadísticas de dispositivos
   * @returns {Promise<Object>} Estadísticas
   */
  async getEstadisticas() {
    const queries = {
      total: 'SELECT COUNT(*) as total FROM Dispositivo WHERE estado_id = 1',
      porCategoria: `
        SELECT c.nombre, COUNT(*) as total 
        FROM Dispositivo d 
        LEFT JOIN Categoria c ON d.categoria_id = c.categoria_id 
        WHERE d.estado_id = 1 
        GROUP BY c.nombre
      `,
      porMarca: `
        SELECT m.nombre, COUNT(*) as total 
        FROM Dispositivo d 
        LEFT JOIN Marca m ON d.marca_id = m.marca_id 
        WHERE d.estado_id = 1 
        GROUP BY m.nombre
      `,
      precioPromedio: 'SELECT AVG(precio) as promedio FROM Dispositivo WHERE estado_id = 1',
      recientes: `
        SELECT * FROM Dispositivo 
        WHERE estado_id = 1 
        ORDER BY fechaLanzamiento DESC 
        LIMIT 5
      `
    };

    const resultados = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.execute(query);
      resultados[key] = result;
    }

    return resultados;
  }
}