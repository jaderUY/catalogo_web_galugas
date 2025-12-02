import axios from 'axios';
import { config } from '../config/environment.js';

/**
 * Cliente HTTP centralizado para llamadas a la API
 */
class APIClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.API_URL,
      timeout: config.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Interceptor para manejo de errores
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }

  /**
   * Maneja errores de manera consistente
   * @private
   */
  handleError(error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Error desconocido';
    const data = error.response?.data;

    console.error(`[API Error ${status}]:`, message);

    return Promise.reject({
      status,
      message,
      data,
      isNetworkError: !error.response
    });
  }

  /**
   * GET - Obtiene dispositivos
   */
  async getDispositivos(params = {}) {
    return this.client.get('/dispositivos', { params });
  }

  /**
   * GET - Obtiene un dispositivo por ID
   */
  async getDispositivoById(id) {
    return this.client.get(`/dispositivos/${id}`);
  }

  /**
   * GET - Busca dispositivos
   */
  async searchDispositivos(query, params = {}) {
    return this.client.get('/dispositivos', {
      params: { ...params, search: query }
    });
  }

  /**
   * GET - Obtiene categorías
   */
  async getCategorias() {
    return this.client.get('/categorias');
  }

  /**
   * GET - Obtiene una categoría por ID
   */
  async getCategoriaById(id) {
    return this.client.get(`/categorias/${id}`);
  }

  /**
   * GET - Obtiene marcas
   */
  async getMarcas() {
    return this.client.get('/marcas');
  }

  /**
   * GET - Obtiene una marca por ID
   */
  async getMarcaById(id) {
    return this.client.get(`/marcas/${id}`);
  }

  /**
   * GET - Health check de la API
   */
  async healthCheck() {
    return this.client.get('/health');
  }

  /**
   * POST - Login de usuario
   */
  async login(email, password) {
    return this.client.post('/auth/login', { email, password });
  }

  /**
   * POST - Registro de usuario
   */
  async register(userData) {
    return this.client.post('/auth/register', userData);
  }

  /**
   * POST - Logout de usuario
   */
  async logout() {
    return this.client.post('/auth/logout');
  }

  /**
   * GET - Obtiene información del usuario actual
   */
  async getCurrentUser() {
    return this.client.get('/auth/me');
  }
}

// Exportar instancia singleton
export default new APIClient();
