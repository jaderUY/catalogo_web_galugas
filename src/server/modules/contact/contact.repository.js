// modules/contact/contact.repository.js
const pool = require('../../config/db');

/**
 * Obtiene todos los contactos
 */
const getAllContacts = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM contacto ORDER BY fecha DESC`
  );
  return rows;
};

/**
 * Obtiene un contacto por ID
 */
const getContactById = async (contacto_id) => {
  const [rows] = await pool.query(
    `SELECT * FROM contacto WHERE contacto_id = ?`,
    [contacto_id]
  );
  return rows[0] || null;
};

/**
 * Crea un nuevo contacto/mensaje
 */
const createContact = async (contactData) => {
  const { nombre, email, asunto, mensaje, usuario_id = null } = contactData;

  const [result] = await pool.query(
    `INSERT INTO contacto (nombre, email, asunto, mensaje, usuario_id, fecha)
     VALUES (?, ?, ?, ?, ?, NOW())`,
    [nombre, email, asunto, mensaje, usuario_id]
  );

  return result.insertId;
};

/**
 * Marca un contacto como resuelto
 */
const markAsResolved = async (contacto_id) => {
  await pool.query(
    `UPDATE contacto SET resuelto = TRUE WHERE contacto_id = ?`,
    [contacto_id]
  );
};

/**
 * Obtiene contactos sin resolver
 */
const getUnresolvedContacts = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM contacto WHERE resuelto = FALSE ORDER BY fecha ASC`
  );
  return rows;
};

module.exports = {
  getAllContacts,
  getContactById,
  createContact,
  markAsResolved,
  getUnresolvedContacts
};
