// modules/auth/auth.repository.js
const pool = require('../../config/db');

/**
 * Obtiene un usuario por email
 */
const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT u.usuario_id, u.contraseña, u.rol_id, e.direccionEmail
     FROM usuario u
     JOIN email e ON u.usuario_id = e.usuario_id
     WHERE e.direccionEmail = ?`,
    [email]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo usuario
 */
const createUser = async (userData) => {
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    email,
    hashedPassword,
    fechaNacimiento,
    direccionResidencia,
    pais_id,
    rol_id = 2
  } = userData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insertar usuario
    const [userResult] = await connection.query(
      `INSERT INTO usuario (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, contraseña, fechaNacimiento, direccionResidencia, rol_id, pais_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        primer_nombre,
        segundo_nombre || null,
        primer_apellido,
        segundo_apellido || null,
        hashedPassword,
        fechaNacimiento,
        direccionResidencia,
        rol_id,
        pais_id
      ]
    );

    const usuario_id = userResult.insertId;

    // Insertar email
    await connection.query(
      `INSERT INTO email (direccionEmail, tipoEmail_id, usuario_id) VALUES (?, 1, ?)`,
      [email, usuario_id]
    );

    await connection.commit();
    return usuario_id;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Obtiene el perfil completo de un usuario
 */
const getUserProfile = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT u.usuario_id, u.primer_nombre, u.segundo_nombre, u.primer_apellido, u.segundo_apellido,
            u.fechaNacimiento, u.direccionResidencia, u.rol_id, u.pais_id, e.direccionEmail
     FROM usuario u
     JOIN email e ON u.usuario_id = e.usuario_id
     WHERE u.usuario_id = ?`,
    [usuario_id]
  );
  return rows[0] || null;
};

/**
 * Obtiene información básica del usuario para sesión
 */
const getUserSessionData = async (usuario_id) => {
  const [rows] = await pool.query(
    `SELECT u.usuario_id, u.rol_id, e.direccionEmail
     FROM usuario u
     JOIN email e ON u.usuario_id = e.usuario_id
     WHERE u.usuario_id = ?`,
    [usuario_id]
  );
  return rows[0] || null;
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserProfile,
  getUserSessionData
};
