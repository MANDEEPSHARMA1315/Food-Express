const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Admin Dashboard
router.get('/', adminController.getDashboard);

// Customer Orders Management & Status Updates
router.get('/orders', adminController.getOrders);
router.post('/orders/status', adminController.postUpdateOrderStatus);

// Food Inventory Management
router.get('/foods', adminController.getFoods);
router.post('/foods/add', adminController.postAddFood);
router.post('/foods/delete/:id', adminController.postDeleteFood);

// Categories Management
router.get('/categories', adminController.getCategories);
router.post('/categories/add', adminController.postAddCategory);

module.exports = router;
