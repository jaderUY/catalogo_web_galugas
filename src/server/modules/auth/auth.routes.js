// modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const { register, login, logout, getProfile } = require('./auth.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { registerValidation, loginValidation } = require('./auth.validation');
const { authMiddleware } = require('../../middlewares/auth.middleware');

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.post('/logout', logout);
router.get('/profile', authMiddleware, getProfile);

module.exports = router;