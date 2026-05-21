// modules/auth/auth.service.js
const pool = require('../../config/db');
const { hashPassword, comparePassword } = require('../../utils/hash');
const { generateToken } = require('../../utils/jwt');

const registerUser = async (userData) => {
  const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, email, password, fechaNacimiento, direccionResidencia, pais_id, rol_id = 2 } = userData;
  const hashedPassword = await hashPassword(password);
  const [result] = await pool.query(
    `INSERT INTO usuario (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, contraseña, fechaNacimiento, direccionResidencia, rol_id, pais_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [primer_nombre, segundo_nombre || null, primer_apellido, segundo_apellido || null, hashedPassword, fechaNacimiento, direccionResidencia, rol_id, pais_id]
  );
  // También insertar email en tabla email
  await pool.query(
    `INSERT INTO email (direccionEmail, tipoEmail_id, usuario_id) VALUES (?, 1, ?)`,
    [email, result.insertId]
  );
  return { usuario_id: result.insertId };
};

const loginUser = async (email, password) => {
  const [rows] = await pool.query(
    `SELECT u.usuario_id, u.contraseña, u.rol_id, e.direccionEmail
     FROM usuario u
     JOIN email e ON u.usuario_id = e.usuario_id
     WHERE e.direccionEmail = ?`,
    [email]
  );
  if (rows.length === 0) throw new Error('Credenciales inválidas');
  const user = rows[0];
  const isMatch = await comparePassword(password, user.contraseña);
  if (!isMatch) throw new Error('Credenciales inválidas');
  const token = generateToken({ usuario_id: user.usuario_id, rol_id: user.rol_id, email: user.direccionEmail });
  return { token, user: { usuario_id: user.usuario_id, rol_id: user.rol_id, email: user.direccionEmail } };
};

const getUserProfile = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT u.usuario_id, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
            u.fechaNacimiento, u.direccionResidencia, u.rol_id, u.pais_id, e.direccionEmail
     FROM usuario u
     JOIN email e ON u.usuario_id = e.usuario_id
     WHERE u.usuario_id = ?`,
    [usuario_id]
  );
  return rows[0];
};

module.exports = { registerUser, loginUser, getUserProfile };