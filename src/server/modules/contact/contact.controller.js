const service = require('./contact.service');

exports.submitContact = async (req, res, next) => {
  try {
    const { nombre, email, telefono, mensaje } = req.body;
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const result = await service.saveContact(nombre, email, telefono, mensaje);
    res.status(201).json({ message: 'Mensaje enviado', id: result.contacto_id });
  } catch (error) {
    next(error);
  }
};