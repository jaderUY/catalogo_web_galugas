// modules/contact/contact.service.js
const contactRepository = require('./contact.repository');
const mailer = require('../../utils/mailer');

/**
 * Guarda un mensaje de contacto y envía email al admin
 * @param {Object} contactData - Datos del contacto
 * @returns {Object} Contacto guardado
 * @throws {Error} Si hay error de validación
 */
const saveContact = async (contactData) => {
  const { nombre, email, asunto, mensaje, usuario_id = null } = contactData;

  // Validaciones
  if (!nombre || nombre.trim() === '') {
    throw new Error('El nombre es requerido');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Email inválido');
  }

  if (!asunto || asunto.trim() === '') {
    throw new Error('El asunto es requerido');
  }

  if (!mensaje || mensaje.trim() === '') {
    throw new Error('El mensaje es requerido');
  }

  if (mensaje.trim().length < 10) {
    throw new Error('El mensaje debe tener al menos 10 caracteres');
  }

  // Guardar en BD
  const contacto_id = await contactRepository.createContact({
    nombre: nombre.trim(),
    email: email.trim(),
    asunto: asunto.trim(),
    mensaje: mensaje.trim(),
    usuario_id
  });

  // Enviar email al admin
  if (process.env.ADMIN_EMAIL) {
    try {
      await mailer.sendEmail(
        process.env.ADMIN_EMAIL,
        `Nuevo mensaje de contacto: ${asunto}`,
        `
        <strong>De:</strong> ${nombre} (${email})\n
        <strong>Asunto:</strong> ${asunto}\n
        <strong>Mensaje:</strong>\n${mensaje}
        `
      );
    } catch (emailError) {
      console.error('Error enviando email de contacto:', emailError);
      // No lanzar error si falla el email, el mensaje se guardó
    }
  }

  return { contacto_id };
};

/**
 * Obtiene todos los contactos (admin)
 * @returns {Array} Lista de contactos
 */
const getAllContacts = async () => {
  const contacts = await contactRepository.getAllContacts();
  return contacts;
};

/**
 * Obtiene un contacto por ID (admin)
 * @param {number} contacto_id - ID del contacto
 * @returns {Object} Datos del contacto
 */
const getContactById = async (contacto_id) => {
  const contact = await contactRepository.getContactById(contacto_id);
  if (!contact) {
    throw new Error('Contacto no encontrado');
  }
  return contact;
};

/**
 * Marca un contacto como resuelto (admin)
 * @param {number} contacto_id - ID del contacto
 */
const resolveContact = async (contacto_id) => {
  const contact = await contactRepository.getContactById(contacto_id);
  if (!contact) {
    throw new Error('Contacto no encontrado');
  }
  await contactRepository.markAsResolved(contacto_id);
};

module.exports = {
  saveContact,
  getAllContacts,
  getContactById,
  resolveContact
};