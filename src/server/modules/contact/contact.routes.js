const express = require('express');
const router = express.Router();
const { submitContact } = require('./contact.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { contactValidation } = require('./contact.validation');

router.post('/', validate(contactValidation), submitContact);
module.exports = router;