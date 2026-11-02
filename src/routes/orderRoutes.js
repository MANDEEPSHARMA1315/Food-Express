const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/orders', orderController.getMyOrders);
router.post('/checkout', orderController.placeOrder);
router.post('/orders/place', orderController.placeOrder);

router.get('/orders/track/:id', orderController.getOrderTracking);
router.get('/orders/track', orderController.getOrderTracking);

module.exports = router;
