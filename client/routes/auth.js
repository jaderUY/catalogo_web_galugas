const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Middleware para redirigir usuarios autenticados
const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Página de login
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('pages/login', {
    title: 'Iniciar Sesión - Galugas',
    meta: {
      description: 'Inicia sesión en tu cuenta Galugas para acceder a tu perfil y realizar compras.',
      keywords: 'login, iniciar sesión, cuenta, galugas'
    }
  });
});

// Procesar login
router.post('/login', redirectIfAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      req.flash('error_msg', 'Email y contraseña son requeridos');
      return res.redirect('/auth/login');
    }

    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });

    // Establecer sesión
    req.session.user = response.data.data;
    req.session.isAuthenticated = true;

    // Log de actividad (opcional)
    console.log(`Usuario ${email} inició sesión`);

    req.flash('success_msg', `¡Bienvenido de nuevo, ${response.data.data.primer_nombre}!`);
    
    // Redirigir a la página anterior o al dashboard si es admin
    const redirectTo = req.session.returnTo || 
                     (response.data.data.rol_nombre === 'Administrador' ? '/admin' : '/');
    delete req.session.returnTo;
    
    res.redirect(redirectTo);
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Error al iniciar sesión. Por favor verifica tus credenciales.';
    
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/login');
  }
});

// Página de registro
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('pages/register', {
    title: 'Registrarse - Galugas',
    meta: {
      description: 'Crea una cuenta en Galugas para disfrutar de todos nuestros servicios y ofertas exclusivas.',
      keywords: 'registro, crear cuenta, registrarse, galugas'
    }
  });
});

// Procesar registro
router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const { primer_nombre, primer_apellido, email, password, confirm_password } = req.body;

    // Validaciones básicas
    if (!primer_nombre || !primer_apellido || !email || !password) {
      req.flash('error_msg', 'Todos los campos son requeridos');
      return res.redirect('/auth/register');
    }

    if (password !== confirm_password) {
      req.flash('error_msg', 'Las contraseñas no coinciden');
      return res.redirect('/auth/register');
    }

    if (password.length < 6) {
      req.flash('error_msg', 'La contraseña debe tener al menos 6 caracteres');
      return res.redirect('/auth/register');
    }

    const response = await axios.post(`${API_URL}/auth/register`, {
      primer_nombre: primer_nombre.trim(),
      primer_apellido: primer_apellido.trim(),
      email: email.toLowerCase().trim(),
      contrasena: password
    });

    req.flash('success_msg', '¡Registro exitoso! Ahora puedes iniciar sesión.');
    res.redirect('/auth/login');
  } catch (error) {
    console.error('Register error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Error al registrar usuario. Por favor intenta nuevamente.';
    
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/register');
  }
});

// Cerrar sesión
router.post('/logout', async (req, res) => {
  try {
    if (req.session.user) {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        headers: {
          'Cookie': `connect.sid=${req.sessionID}`
        }
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.redirect('/');
    });
  }
});

// Perfil de usuario (vista)
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    req.flash('error_msg', 'Por favor inicia sesión para ver tu perfil');
    return res.redirect('/auth/login');
  }

  res.render('pages/profile', {
    title: 'Mi Perfil - Galugas',
    user: req.session.user,
    meta: {
      description: 'Gestiona tu perfil de usuario en Galugas.',
      keywords: 'perfil, usuario, cuenta, configuración'
    }
  });
});

// Actualizar perfil
router.post('/profile', async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Por favor inicia sesión');
      return res.redirect('/auth/login');
    }

    const { primer_nombre, primer_apellido, email } = req.body;

    const response = await axios.put(`${API_URL}/auth/profile`, {
      primer_nombre: primer_nombre.trim(),
      primer_apellido: primer_apellido.trim(),
      email: email.toLowerCase().trim()
    }, {
      headers: {
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });

    // Actualizar sesión
    req.session.user = { ...req.session.user, ...response.data.data };

    req.flash('success_msg', 'Perfil actualizado exitosamente');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Profile update error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        'Error al actualizar el perfil';
    
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/profile');
  }
});

// Cambiar contraseña
router.post('/change-password', async (req, res) => {
  try {
    if (!req.session.user) {
      req.flash('error_msg', 'Por favor inicia sesión');
      return res.redirect('/auth/login');
    }

    const { current_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      req.flash('error_msg', 'Las nuevas contraseñas no coinciden');
      return res.redirect('/auth/profile');
    }

    if (new_password.length < 6) {
      req.flash('error_msg', 'La nueva contraseña debe tener al menos 6 caracteres');
      return res.redirect('/auth/profile');
    }

    await axios.put(`${API_URL}/auth/change-password`, {
      currentPassword: current_password,
      newPassword: new_password
    }, {
      headers: {
        'Cookie': `connect.sid=${req.sessionID}`
      }
    });

    req.flash('success_msg', 'Contraseña cambiada exitosamente');
    res.redirect('/auth/profile');
  } catch (error) {
    console.error('Password change error:', error.response?.data || error.message);
    
    const errorMessage = error.response?.data?.error || 
                        'Error al cambiar la contraseña';
    
    req.flash('error_msg', errorMessage);
    res.redirect('/auth/profile');
  }
});

module.exports = router;