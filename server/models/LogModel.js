import BaseModel from './BaseModel.js';

/**
 * Modelo para la entidad LogActividad
 * @extends BaseModel
 */
export default class LogModel extends BaseModel {
  constructor() {
    super('LogActividad');
  }

  /**
   * Registra una nueva actividad en el log
   * @param {Object} logData - Datos del log
   * @returns {Promise<Object>} Log creado
   */
  async registrarActividad(logData) {
    const datosLog = {
      usuario_id: logData.usuario_id || null,
      tipo_usuario: logData.tipo_usuario || 'Sistema',
      accion: logData.accion,
      modulo: logData.modulo,
      descripcion: logData.descripcion,
      ip_address: logData.ip_address || null,
      user_agent: logData.user_agent || null,
      recurso_afectado: logData.recurso_afectado || null,
      id_recurso_afectado: logData.id_recurso_afectado || null,
      metadata: logData.metadata ? JSON.stringify(logData.metadata) : null
    };

    return await this.create(datosLog);
  }

  /**
   * Obtiene logs con filtros y paginación
   * @param {Object} filtros - Filtros de búsqueda
   * @param {number} pagina - Página actual
   * @param {number} limite - Límite por página
   * @returns {Promise<Object>} Logs y metadatos de paginación
   */
  async obtenerLogsConFiltros(filtros = {}, pagina = 1, limite = 50) {
    const offset = (pagina - 1) * limite;
    
    let query = `
      SELECT l.*, u.primer_nombre, u.primer_apellido, u.email 
      FROM LogActividad l
      LEFT JOIN Usuario u ON l.usuario_id = u.usuario_id
      WHERE 1=1
    `;
    
    const params = [];
    const condiciones = [];

    // Aplicar filtros
    if (filtros.tipo_usuario) {
      condiciones.push('l.tipo_usuario = ?');
      params.push(filtros.tipo_usuario);
    }

    if (filtros.modulo) {
      condiciones.push('l.modulo = ?');
      params.push(filtros.modulo);
    }

    if (filtros.accion) {
      condiciones.push('l.accion = ?');
      params.push(filtros.accion);
    }

    if (filtros.usuario_id) {
      condiciones.push('l.usuario_id = ?');
      params.push(filtros.usuario_id);
    }

    if (filtros.fecha_desde) {
      condiciones.push('DATE(l.fecha_creacion) >= ?');
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      condiciones.push('DATE(l.fecha_creacion) <= ?');
      params.push(filtros.fecha_hasta);
    }

    if (filtros.busqueda) {
      condiciones.push('(l.descripcion LIKE ? OR u.primer_nombre LIKE ? OR u.primer_apellido LIKE ?)');
      const terminoBusqueda = `%${filtros.busqueda}%`;
      params.push(terminoBusqueda, terminoBusqueda, terminoBusqueda);
    }

    if (condiciones.length > 0) {
      query += ` AND ${condiciones.join(' AND ')}`;
    }

    // Ordenar por fecha descendente
    query += ' ORDER BY l.fecha_creacion DESC';

    // Paginación
    query += ' LIMIT ? OFFSET ?';
    params.push(limite, offset);

    const logs = await this.execute(query, params);

    // Obtener total para paginación
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM LogActividad l
      LEFT JOIN Usuario u ON l.usuario_id = u.usuario_id
      WHERE 1=1 ${condiciones.length > 0 ? `AND ${condiciones.join(' AND ')}` : ''}
    `;
    
    const totalResult = await this.execute(countQuery, params.slice(0, -2)); // Remover limit y offset
    const total = totalResult[0].total;

    return {
      logs,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total,
        paginas: Math.ceil(total / limite)
      }
    };
  }

  /**
   * Obtiene estadísticas de actividad
   * @param {string} periodo - Periodo: 'dia', 'semana', 'mes'
   * @returns {Promise<Object>} Estadísticas
   */
  async obtenerEstadisticas(periodo = 'dia') {
    let intervalo = '';
    
    switch (periodo) {
      case 'dia':
        intervalo = 'INTERVAL 1 DAY';
        break;
      case 'semana':
        intervalo = 'INTERVAL 7 DAY';
        break;
      case 'mes':
        intervalo = 'INTERVAL 30 DAY';
        break;
      default:
        intervalo = 'INTERVAL 1 DAY';
    }

    const queries = {
      actividadesPorTipo: `
        SELECT tipo_usuario, COUNT(*) as total 
        FROM LogActividad 
        WHERE fecha_creacion >= DATE_SUB(NOW(), ${intervalo})
        GROUP BY tipo_usuario
      `,
      actividadesPorModulo: `
        SELECT modulo, COUNT(*) as total 
        FROM LogActividad 
        WHERE fecha_creacion >= DATE_SUB(NOW(), ${intervalo})
        GROUP BY modulo 
        ORDER BY total DESC 
        LIMIT 10
      `,
      actividadesPorAccion: `
        SELECT accion, COUNT(*) as total 
        FROM LogActividad 
        WHERE fecha_creacion >= DATE_SUB(NOW(), ${intervalo})
        GROUP BY accion 
        ORDER BY total DESC 
        LIMIT 10
      `,
      usuariosActivos: `
        SELECT COUNT(DISTINCT usuario_id) as total 
        FROM LogActividad 
        WHERE fecha_creacion >= DATE_SUB(NOW(), ${intervalo}) 
        AND usuario_id IS NOT NULL
      `,
      totalActividades: `
        SELECT COUNT(*) as total 
        FROM LogActividad 
        WHERE fecha_creacion >= DATE_SUB(NOW(), ${intervalo})
      `
    };

    const resultados = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const result = await this.execute(query);
      resultados[key] = result;
    }

    return resultados;
  }

  /**
   * Obtiene actividades recientes de un usuario
   * @param {number} usuarioId - ID del usuario
   * @param {number} limite - Límite de resultados
   * @returns {Promise<Array>} Actividades recientes
   */
  async obtenerActividadesUsuario(usuarioId, limite = 20) {
    const query = `
      SELECT * FROM LogActividad 
      WHERE usuario_id = ? 
      ORDER BY fecha_creacion DESC 
      LIMIT ?
    `;
    
    const actividades = await this.execute(query, [usuarioId, limite]);
    return actividades;
  }

  /**
   * Limpia logs antiguos
   * @param {number} diasMantener - Días a mantener
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  async limpiarLogsAntiguos(diasMantener = 90) {
    const query = `
      DELETE FROM LogActividad 
      WHERE fecha_creacion < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    
    const result = await this.execute(query, [diasMantener]);
    
    return {
      eliminados: result.affectedRows,
      mensaje: `Logs anteriores a ${diasMantener} días eliminados`
    };
  }
}