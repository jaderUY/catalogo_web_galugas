// modules/contact/contact.controller.js
const contactService = require('./contact.service');

const submitContact = async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;
  const usuario_id = req.user?.usuario_id || null;

  const result = await contactService.saveContact({
    nombre,
    email,
    asunto,
    mensaje,
    usuario_id
  });

  res.status(201).json({
    success: true,
    message: 'Mensaje enviado correctamente',
    data: result
  });
};

const getContacts = async (req, res) => {
  const contacts = await contactService.getAllContacts();
  res.json({
    success: true,
    data: contacts
  });
};

const getContactDetail = async (req, res) => {
  const contact = await contactService.getContactById(req.params.contacto_id);
  res.json({
    success: true,
    data: contact
  });
};

const resolveContact = async (req, res) => {
  await contactService.resolveContact(req.params.contacto_id);
  res.json({
    success: true,
    message: 'Contacto marcado como resuelto'
  });
};

module.exports = {
  submitContact,
  getContacts,
  getContactDetail,
  resolveContact
};