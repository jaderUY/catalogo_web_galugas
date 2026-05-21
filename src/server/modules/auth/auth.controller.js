// modules/auth/auth.controller.js
const authService = require('./auth.service');
const env = require('../../config/env');

const register = async (req, res, next) => {
  try {
    const createdUser = await authService.registerUser(req.body);
    res.status(201).json({ message: 'Usuario registrado exitosamente', userId: createdUser.usuario_id });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    const token = result.token;

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
      maxAge: env.SESSION_MAX_AGE
    });

    if (req.session) {
      req.session.userId = result.user.usuario_id;
      req.session.rolId = result.user.rol_id;
      req.session.email = result.user.email;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.clearCookie('token');
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  } else {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada exitosamente' });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getUserProfile(req.user.usuario_id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile };