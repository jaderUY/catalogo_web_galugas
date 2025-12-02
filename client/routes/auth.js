import express from 'express';
import apiClient from '../services/APIClient.js';
import { isValidEmail, isValidPassword } from '../utils/helpers.js';
import { MESSAGES } from '../constants/app.js';

const router = express.Router();

/**
 * Middleware para redirigir usuarios autenticados
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

/**
 * Middleware para verificar autenticación
 */
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * GET - Página de login
 */
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('pages/login', {
    title: 'Iniciar Sesión - Galugas',
    meta: {
      description: 'Inicia sesión en tu cuenta Galugas para acceder a tu perfil y realizar compras.',
      keywords: 'login, iniciar sesión, cuenta, galugas'
    }
  });
});

/**
 * POST - Procesar login
 */
router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      req.flash('error_msg', 'Email y contraseña son requeridos');
      return res.redirect('/auth/login');
    }

    if (!isValidEmail(email)) {
      req.flash('error_msg', 'Email inválido');
      return res.redirect('/auth/login');
    }

    const response = await apiClient.login(email, password);
    const userData = response.data?.data;

    if (!userData) {
      req.flash('error_msg', MESSAGES.ERROR.INVALID_INPUT);
      return res.redirect('/auth/login');
    }

    // Establecer sesión
    req.session.user = userData;
    req.session.isAuthenticated = true;

    console.log(`Usuario ${email} inició sesión`);
    req.flash('success_msg', `¡Bienvenido de nuevo, ${userData.primer_nombre}!`);

    // Redirigir apropiadamente
    const redirectTo = req.session.returnTo || 
                     (userData.rol_nombre === 'Administrador' ? '/admin' : '/');
    delete req.session.returnTo;

    res.redirect(redirectTo);
  } catch (error) {
    console.error('Login error:', error.message);

    const errorMessage = error.data?.error || 
                        error.data?.message || 
                        MESSAGES.ERROR.SERVER_ERROR;

    req.flash('error_msg', errorMessage);
    res.redirect('/auth/login');
  }
});

/**
 * GET - Página de registro
 */
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('pages/register', {
    title: 'Registrarse - Galugas',
    meta: {
      description: 'Crea una cuenta en Galugas para disfrutar de todos nuestros servicios y ofertas exclusivas.',
      keywords: 'registro, crear cuenta, registrarse, galugas'
    }
  });
});

/**
 * POST - Procesar registro
 */
router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { primer_nombre, primer_apellido, email, password, confirm_password } = req.body;

    // Validaciones
    if (!primer_nombre || !primer_apellido || !email || !password) {
      req.flash('error_msg', 'Todos los campos son requeridos');
      return res.redirect('/auth/register');
    }

    if (!isValidEmail(email)) {
      req.flash('error_msg', 'Email inválido');
      return res.redirect('/auth/register');
    }

    if (password !== confirm_password) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/auth/register');
    }

    if (!isValidPassword(password)) {
      req.flash('error_msg', 'La contraseña debe tener al menos 6 caracteres y contener letras y números');
      return res.redirect('/auth/register');
    }

    const response = await apiClient.register({
      primer_nombre: primer_nombre.trim(),
      primer_apellido: primer_apellido.trim(),
      email: email.toLowerCase().trim(),
      contrasena: password
    });

    req.flash('success_msg', '¡Registro exitoso! Ahora puedes iniciar sesión.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Register error:', error.message);

    const errorMessage = error.data?.error || 
                        error.data?.message || 
                        MESSAGES.ERROR.SERVER_ERROR;

    req.flash('error_msg', errorMessage);
    res.redirect('/auth/register');
  }
});

/**
 * POST - Cerrar sesión
 */
router.post('/logout', async (req, res) => {
  try {
    if (req.session.user) {
      await apiClient.logout();
      console.log(`Usuario cerró sesión`);
    }
  } catch (error) {
    console.error('Logout error:', error.message);
  } finally {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  }
});

/**
 * GET - Perfil de usuario (vista)
 */
router.get('/profile', requireAuth, (req, res) => {
  res.render('pages/profile', {
    title: 'Mi Perfil - Galugas',
    user: req.session.user,
    meta: {
      description: 'Gestiona tu perfil de usuario en Galugas.',
      keywords: 'perfil, usuario, cuenta, configuración'
    }
  });
});

/**
 * PUT - Actualizar perfil
 */
router.post('/profile', requireAuth, async (req, res) => {
  try {
    const { primer_nombre, primer_apellido, email } = req.body;

    // Validaciones
    if (!primer_nombre || !primer_apellido || !email) {
      req.flash('error_msg', 'Todos los campos son requeridos');
      return res.redirect('/auth/profile');
    }

    if (!isValidEmail(email)) {
      req.flash('error_msg', 'Email inválido');
      return res.redirect('/auth/profile');
    }

    const response = await apiClient.client.put('/auth/profile', {
      primer_nombre: primer_nombre.trim(),
      primer_apellido: primer_apellido.trim(),
      email: email.toLowerCase().trim()
    });

    // Actualizar sesión
    req.session.user = { ...req.session.user, ...response.data?.data };

    req.flash('success_msg', MESSAGES.SUCCESS.UPDATE);
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Profile update error:', error.message);

    const errorMessage = error.data?.error || MESSAGES.ERROR.SERVER_ERROR;
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/profile');
  }
});

/**
 * PUT - Cambiar contraseña
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validaciones
    if (!current_password || !new_password || !confirm_password) {
      req.flash('error_msg', 'Todos los campos son requeridos');
      return res.redirect('/auth/profile');
    }

    if (new_password !== confirm_password) {
      req.flash('error_msg', 'Las nuevas contraseñas no coinciden');
      return res.redirect('/auth/profile');
    }

    if (!isValidPassword(new_password)) {
      req.flash('error_msg', 'La nueva contraseña debe tener al menos 6 caracteres y contener letras y números');
      return res.redirect('/auth/profile');
    }

    await apiClient.client.put('/auth/change-password', {
      currentPassword: current_password,
      newPassword: new_password
    });

    req.flash('success_msg', 'Contraseña cambiada exitosamente');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Password change error:', error.message);

    const errorMessage = error.data?.error || MESSAGES.ERROR.SERVER_ERROR;
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/profile');
  }
});

export default router;