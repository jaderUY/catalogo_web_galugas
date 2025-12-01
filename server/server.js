import express from 'express';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración
import { config, validateConfig } from './config/environment.js';
import database from './config/database.js';

// Middlewares
import { errorHandler, notFound } from './utils/ErrorHandler.js';
import loggingMiddleware from './middleware/LoggingMiddleware.js';
import AuthMiddleware from './middleware/AuthMiddleware.js';

// Rutas
import apiRoutes from './routes/index.js';

// Configuración de ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.initializeConfig();
    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Valida la configuración del entorno
   */
  initializeConfig() {
    validateConfig();
    console.log('🎯 Entorno:', config.NODE_ENV);
  }

  /**
   * Inicializa la conexión a la base de datos
   */
  async initializeDatabase() {
    try {
      await database.initialize();
    } catch (error) {
      console.error('❌ Error crítico: No se pudo conectar a la base de datos');
      process.exit(1);
    }
  }

  /**
   * Configura los middlewares de la aplicación
   */
  initializeMiddlewares() {
    // Seguridad
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // CORS
    this.app.use(cors({
      origin: config.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.RATE_LIMIT_WINDOW,
      max: config.RATE_LIMIT_MAX,
      message: {
        error: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde',
        timestamp: new Date().toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Sesiones
    this.app.use(session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: config.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      },
      name: 'galugas.sid'
    }));

    // Servir archivos estáticos
    this.app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Logging
    this.app.use(loggingMiddleware.logRequests());

    // Información de usuario
    this.app.use(AuthMiddleware.injectUserData);
  }

  /**
   * Configura las rutas de la aplicación
   */
  initializeRoutes() {
    // API routes
    this.app.use('/api', apiRoutes);

    // Ruta de bienvenida
    this.app.get('/', (req, res) => {
      res.json({
        message: '🚀 Servidor Galugas API funcionando correctamente',
        version: '1.0.0',
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        documentation: '/api'
      });
    });
  }

  /**
   * Configura el manejo de errores
   */
  initializeErrorHandling() {
    // Manejo de rutas no encontradas
    this.app.use(notFound);

    // Manejo global de errores
    this.app.use(errorHandler);
  }

  /**
   * Inicia el servidor
   */
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log('='.repeat(60));
      console.log('🚀 Servidor Galugas API iniciado exitosamente');
      console.log('='.repeat(60));
      console.log(`📍 Puerto: ${this.port}`);
      console.log(`🌍 Entorno: ${config.NODE_ENV}`);
      console.log(`📅 Iniciado: ${new Date().toISOString()}`);
      console.log(`🔗 URL: http://localhost:${this.port}`);
      console.log(`👤 Cliente: ${config.CLIENT_URL}`);
      console.log(`🗄️  Base de datos: ${config.DB_HOST}/${config.DB_NAME}`);
      console.log('='.repeat(60));
    });

    // Manejo graceful shutdown
    this.setupGracefulShutdown();
  }

  /**
   * Configura el cierre graceful del servidor
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\n📞 Recibido ${signal}. Cerrando servidor...`);
      
      this.server.close(async () => {
        console.log('🔒 Servidor HTTP cerrado');
        
        await database.close();
        console.log('🗄️  Conexión a base de datos cerrada');
        
        console.log('👋 Servidor cerrado exitosamente');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('⏰ Timeout forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      process.exit(1);
    });
  }
}

// Crear e iniciar el servidor
const server = new Server();
server.start();

export default server;