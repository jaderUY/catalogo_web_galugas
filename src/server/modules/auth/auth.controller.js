// modules/auth/auth.controller.js
const authService = require('./auth.service');

const register = async (req, res) => {
  const createdUser = await authService.registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: { usuario_id: createdUser.usuario_id }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);

  // Guardar en sesión (sin JWT)
  req.session.userId = user.usuario_id;
  req.session.rolId = user.rol_id;
  req.session.email = user.email;

  res.json({
    success: true,
    message: 'Sesión iniciada exitosamente',
    data: user
  });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.clearCookie('connect.sid');
      return res.json({ success: true, message: 'Sesión cerrada' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
};

const getProfile = async (req, res) => {
  const profile = await authService.getUserProfile(req.user.usuario_id);
  res.json({
    success: true,
    data: profile
  });
};

module.exports = {
  register,
  login,
  logout,
  getProfile
};