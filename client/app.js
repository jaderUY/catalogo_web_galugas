import express from 'express';
import path from 'path';
import session from 'express-session';
import flash from 'connect-flash';
import { fileURLToPath } from 'url';

// Configuración
import { config, validateConfig } from './config/environment.js';
import { ROLES } from './constants/app.js';

// Rutas
import indexRoutes from './routes/index.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import dispositivosRoutes from './routes/dispositivos.js';
import apiRoutes from './routes/api.js';

// Configuración de rutas de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ClientApp {
  constructor() {
    this.app = express();
    this.port = config.PORT;
    
    this.initializeConfig();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Valida la configuración del entorno
   */
  initializeConfig() {
    validateConfig();
    console.log('Client configuration validated');
  }

  /**
   * Configura los middlewares de la aplicación
   */
  initializeMiddlewares() {
    // Motor de vistas
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));

    // Archivos estáticos
    this.app.use(express.static(path.join(__dirname, 'public')));

    // Body parsing
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(express.json({ limit: '10mb' }));

    // Sesiones
    this.app.use(session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: config.IS_PRODUCTION,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
      },
      name: 'galugas.client.sid'
    }));

    // Flash messages
    this.app.use(flash());

    // Variables globales para las vistas
    this.app.use((req, res, next) => {
      const user = req.session.user;
      
      res.locals.success_msg = req.flash('success_msg');
      res.locals.error_msg = req.flash('error_msg');
      res.locals.user = user || null;
      res.locals.isAuthenticated = !!user;
      res.locals.isAdmin = user?.rol_nombre === ROLES.ADMIN;
      res.locals.isVendedor = [ROLES.VENDEDOR, ROLES.ADMIN].includes(user?.rol_nombre);
      res.locals.API_URL = config.API_URL;
      res.locals.NODE_ENV = config.NODE_ENV;
      
      next();
    });
  }

  /**
   * Configura las rutas de la aplicación
   */
  initializeRoutes() {
    this.app.use('/', indexRoutes);
    this.app.use('/auth', authRoutes);
    this.app.use('/admin', adminRoutes);
    this.app.use('/dispositivos', dispositivosRoutes);
    this.app.use('/api', apiRoutes);
  }

  /**
   * Configura el manejo de errores
   */
  initializeErrorHandling() {
    // Página 404
    this.app.use((req, res) => {
      res.status(404).render('error/404', {
        title: 'Página No Encontrada - Galugas',
        user: req.session.user || null
      });
    });

    // Manejo global de errores
    this.app.use((err, req, res, next) => {
      console.error('ERROR Error del servidor:', err.message);
      console.error(err.stack);
      
      res.status(500).render('error/500', {
        title: 'Error del Servidor - Galugas',
        user: req.session.user || null,
        errorMessage: config.IS_PRODUCTION ? 'Error interno del servidor' : err.message
      });
    });
  }

  /**
   * Inicia la aplicación
   */
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log('='.repeat(60));
      console.log('Client application started successfully');
      console.log('='.repeat(60));
      console.log(`Port: ${this.port}`);
      console.log(`Environment: ${config.NODE_ENV}`);
      console.log(`URL: http://localhost:${this.port}`);
      console.log(`API: ${config.API_URL}`);
      console.log('='.repeat(60));
    });

    this.setupGracefulShutdown();
  }

  /**
   * Configura el cierre graceful de la aplicación
   */
  setupGracefulShutdown() {
    const shutdown = async (signal) => {
      console.log(`\nReceived ${signal}. Shutting down client...`);
      
      this.server.close(() => {
        console.log('HTTP server closed');
        console.log('Client shutdown successfully');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error('Timeout: forcing client shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  }
}

// Crear e iniciar la aplicación
const clientApp = new ClientApp();
clientApp.start();

export default clientApp.app;