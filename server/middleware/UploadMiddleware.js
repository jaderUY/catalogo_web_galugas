import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/environment.js';
import { AppError } from '../utils/ErrorHandler.js';

/**
 * Clase para gestionar la subida de archivos
 */
class UploadManager {
  constructor() {
    this.uploadDir = config.UPLOAD_PATH;
    this._ensureUploadDirExists();
  }

  /**
   * Crea el directorio de uploads si no existe
   * @private
   */
  _ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      console.log('📁 Directorio de uploads creado:', this.uploadDir);
    }
  }

  /**
   * Configura el almacenamiento para Multer
   * @returns {Object} Configuración de almacenamiento
   */
  _getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = `device-${uniqueSuffix}${extension}`;
        cb(null, filename);
      }
    });
  }

  /**
   * Filtra los archivos permitidos
   * @param {Object} req - Request object
   * @param {Object} file - Archivo a filtrar
   * @param {Function} cb - Callback
   */
  _fileFilter(req, file, cb) {
    const allowedMimes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(
        'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP, SVG)',
        400
      ), false);
    }
  }

  /**
   * Obtiene el middleware de Multer configurado
   * @param {Object} options - Opciones adicionales
   * @returns {Object} Middleware de Multer
   */
  getUploadMiddleware(options = {}) {
    const config = {
      storage: this._getStorage(),
      limits: {
        fileSize: options.fileSize || config.MAX_FILE_SIZE
      },
      fileFilter: this._fileFilter.bind(this)
    };

    return multer(config);
  }

  /**
   * Maneja errores de Multer
   * @param {Error} error - Error de Multer
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  handleUploadError(error, req, res, next) {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(
          `El archivo es demasiado grande. Tamaño máximo: ${config.MAX_FILE_SIZE / 1024 / 1024}MB`,
          400
        ));
      }
      
      if (error.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError('Demasiados archivos', 400));
      }
      
      if (error.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new AppError('Campo de archivo inesperado', 400));
      }
    }
    
    next(error);
  }

  /**
   * Elimina un archivo del sistema
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<boolean>} True si se eliminó
   */
  async deleteFile(filename) {
    if (!filename) return false;

    const filePath = path.join(this.uploadDir, filename);
    
    return new Promise((resolve) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.warn(`No se pudo eliminar el archivo: ${filePath}`, err.message);
          resolve(false);
        } else {
          console.log(`🗑️  Archivo eliminado: ${filename}`);
          resolve(true);
        }
      });
    });
  }

  /**
   * Obtiene la ruta completa de un archivo
   * @param {string} filename - Nombre del archivo
   * @returns {string} Ruta completa
   */
  getFilePath(filename) {
    return path.join(this.uploadDir, filename);
  }

  /**
   * Verifica si un archivo existe
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<boolean>} True si existe
   */
  async fileExists(filename) {
    if (!filename) return false;

    const filePath = this.getFilePath(filename);
    
    return new Promise((resolve) => {
      fs.access(filePath, fs.constants.F_OK, (err) => {
        resolve(!err);
      });
    });
  }

  /**
   * Obtiene información de un archivo
   * @param {string} filename - Nombre del archivo
   * @returns {Promise<Object>} Información del archivo
   */
  async getFileInfo(filename) {
    if (!filename) return null;

    const filePath = this.getFilePath(filename);
    
    return new Promise((resolve) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          resolve(null);
        } else {
          resolve({
            filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          });
        }
      });
    });
  }
}

// Singleton para el upload manager
const uploadManager = new UploadManager();

// Middlewares preconfigurados
export const upload = uploadManager.getUploadMiddleware();
export const uploadSingle = (fieldName = 'imagen') => 
  upload.single(fieldName);
export const uploadMultiple = (fieldName = 'imagenes', maxCount = 5) => 
  upload.array(fieldName, maxCount);
export const handleUploadErrors = uploadManager.handleUploadError.bind(uploadManager);

export default uploadManager;