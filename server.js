// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const morgan = require('morgan');
const env = require('./src/server/config/env');
const { setUserLocals, authPages: authPageGuard, adminPages: adminPageGuard } = require('./src/server/middlewares/viewAuth');
const errorHandler = require('./src/server/middlewares/errorHandler');
const notFound = require('./src/server/middlewares/notFound');

const authRoutes = require('./src/server/modules/auth/auth.routes');
const authPagesRoutes = require('./src/server/modules/auth/auth.pages');
const productRoutes = require('./src/server/modules/products/product.routes');
const productPages = require('./src/server/modules/products/product.pages');
const cartRoutes = require('./src/server/modules/cart/cart.routes');
const orderRoutes = require('./src/server/modules/orders/order.routes');
const orderPages = require('./src/server/modules/orders/order.pages');
const contactRoutes = require('./src/server/modules/contact/contact.routes');
const contactPages = require('./src/server/modules/contact/contact.pages');
const adminRoutes = require('./src/server/modules/admin/admin.routes');
const adminPages = require('./src/server/modules/admin/admin.pages');
const reviewRoutes = require('./src/server/modules/reviews/review.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/client'));

if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src/client')));
app.use(session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    maxAge: env.SESSION_MAX_AGE
  }
}));
app.use(setUserLocals);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

app.use('/', authPagesRoutes);
app.use('/', productPages);
app.use('/', contactPages);
app.use('/', orderPages);
app.get('/cart', authPageGuard, (req, res) => {
  res.render('cart/cart', { title: 'Carrito de Compras' });
});

app.use('/admin', adminPageGuard, adminPages);

app.get('/', (req, res) => res.redirect('/products'));

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${env.PORT}`);
  });
}

module.exports = app;
