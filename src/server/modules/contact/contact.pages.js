const express = require('express');
const router = express.Router();
router.get('/contacto', (req, res) => res.render('modules/contact/contacto', { title: 'Contáctanos' }));
router.get('/nosotros', (req, res) => res.render('modules/contact/nosotros', { title: 'Sobre Galugas' }));
router.get('/privacidad', (req, res) => res.render('modules/contact/privacidad', { title: 'Política de privacidad' }));
router.get('/terminos', (req, res) => res.render('modules/contact/terminos', { title: 'Términos y condiciones' }));
module.exports = router;