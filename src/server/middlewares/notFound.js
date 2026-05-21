const notFound = (req, res) => {
  if (req.accepts('html')) {
    return res.status(404).send('<h1>404 - Página no encontrada</h1>');
  }

  res.status(404).json({ message: 'Ruta no encontrada' });
};

module.exports = notFound;
