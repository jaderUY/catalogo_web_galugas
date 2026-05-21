const pool = require('../../config/db');
const sendEmail = require('../../utils/mailer');

const saveContact = async (nombre, email, telefono, mensaje) => {
  const [res] = await pool.query(
    `INSERT INTO contacto (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)`,
    [nombre, email, telefono, mensaje]
  );

  if (process.env.ADMIN_EMAIL) {
    await sendEmail(
      process.env.ADMIN_EMAIL,
      'Nuevo mensaje de contacto',
      `De: ${nombre} <${email}>\nTeléfono: ${telefono || 'no proporcionado'}\n\n${mensaje}`
    );
  }

  return { contacto_id: res.insertId };
};

module.exports = { saveContact };