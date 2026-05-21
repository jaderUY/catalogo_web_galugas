// modules/auth/auth.pages.js
const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'Iniciar Sesión' });
});

router.get('/register', (req, res) => {
  res.render('auth/register', { title: 'Registro' });
});

module.exports = router;