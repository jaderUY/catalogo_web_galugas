// utils/hash.js
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../config/env');

const hashPassword = async (password) => {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
};

const comparePassword = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};

module.exports = { hashPassword, comparePassword };