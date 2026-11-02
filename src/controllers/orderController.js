const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');

/**
 * Controller to handle order placement via ACID Database Transaction
 */
const placeOrder = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const { name, phone, address, paymentMethod, notes, landmark } = req.body;

    const cartItems = await CartModel.getByUserId(userId);
    if (!cartItems || cartItems.length === 0) {
      req.session.errorMessage = 'Your cart is empty. Please add items before placing an order.';
      return res.redirect('/menu');
    }

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal > 600 ? 50 : 0;
    const total = Math.max(0, subtotal + deliveryFee + tax - discount);

    const fullAddress = landmark ? `${address} (Landmark: ${landmark})` : address;

    // Execute ACID transaction
    const { orderNumber } = await OrderModel.createOrderTransaction({
      userId,
      items: cartItems,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
      deliveryAddress: fullAddress || 'Home Address',
      phone: phone || '+91 98765 43210',
      paymentMethod: paymentMethod || 'Cash on Delivery',
      notes: notes || ''
    });

    req.session.successMessage = `Order #${orderNumber} placed successfully! Tracking your delivery...`;
    res.redirect(`/orders/track/${orderNumber}`);
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to view list of customer orders
 */
const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const orders = await OrderModel.getByUserId(userId);

    res.render('pages/orders', {
      title: 'My Previous Orders – FoodExpress',
      orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to track a specific order with visual milestone steps
 */
const getOrderTracking = async (req, res, next) => {
  try {
    const orderId = req.params.id || 'FE-8921';
    let order = await OrderModel.getByOrderNumber(orderId);

    // Fallback to latest order if specific ID is not matched
    if (!order) {
      const allOrders = await OrderModel.getAllOrders();
      order = allOrders[0] || {
        id: 'FE-8921',
        status: 'Out for Delivery',
        statusStep: 4,
        statusColor: 'primary',
        estimatedDelivery: '25-30 mins',
        items: [{ name: 'Classic Smash Cheeseburger', qty: 2, price: 199 }],
        subtotal: 398,
        deliveryFee: 40,
        tax: 20,
        discount: 0,
        total: 458,
        deliveryAddress: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
        paymentMethod: 'Cash on Delivery',
        rider: { name: 'Ramesh Verma', phone: '+91 98765 43210', vehicle: 'Hero Electric (MH 01 AB 4321)' }
      };
    }

    const steps = [
      { title: 'Order Placed', desc: 'We received your order', step: 1, icon: 'bi-receipt' },
      { title: 'Confirmed', desc: 'Restaurant confirmed the order', step: 2, icon: 'bi-check-circle-fill' },
      { title: 'Preparing', desc: 'Chef is cooking your fresh meal', step: 3, icon: 'bi-fire' },
      { title: 'Out for Delivery', desc: 'Rider is on the way to you', step: 4, icon: 'bi-bicycle' },
      { title: 'Delivered', desc: 'Enjoy your delicious food!', step: 5, icon: 'bi-bag-check-fill' }
    ];

    res.render('pages/order-tracking', {
      title: `Track Order #${order.id} – FoodExpress`,
      order,
      steps
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderTracking
};
