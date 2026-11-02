const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const foodRoutes = require('./foodRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');

// Public & Customer Routes
router.get('/', homeController.getHomePage);
router.use('/', foodRoutes);
router.use('/', cartRoutes);
router.use('/', orderRoutes);
router.use('/', authRoutes);

// Admin Routes (namespaced with /admin)
router.use('/admin', adminRoutes);

// 404 Not Found Catch-All
router.use((req, res) => {
  res.status(404).render('pages/404', {
    title: '404 - Page Not Found – FoodExpress',
    message: 'The page you are looking for does not exist or has been moved.'
  });
});

module.exports = router;
