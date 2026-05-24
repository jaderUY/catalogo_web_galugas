// middlewares/notFound.js
const notFound = (req, res) => {
  const message = `No encontrado: ${req.method} ${req.path}`;

  if (req.accepts('html')) {
    return res.status(404).render('error', {
      title: 'Página no encontrada',
      message: 'La página que buscas no existe.',
      status: 404
    }).catch(() => {
      // Si no puede renderizar, responder con HTML simple
      res.status(404).send('<h1>404 - Página no encontrada</h1>');
    });
  }

  res.status(404).json({
    success: false,
    message,
    status: 404
  });
};

module.exports = notFound;
