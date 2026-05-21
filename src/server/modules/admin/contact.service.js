const pool = require('../../config/db');
const sendEmail = require('../../utils/mailer'); // crear luego

const saveContact = async (nombre, email, telefono, mensaje) => {
    const [res] = await pool.query(
        `INSERT INTO contacto (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)`,
        [nombre, email, telefono, mensaje]
    );
    // Opcional: enviar email al admin
    await sendEmail(process.env.ADMIN_EMAIL, 'Nuevo mensaje de contacto', `De: ${nombre} <${email}>\nMensaje: ${mensaje}`);
    return { contacto_id: res.insertId };
};
module.exports = { saveContact };