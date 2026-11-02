const CartModel = require('../models/cartModel');
const UserModel = require('../models/userModel');

/**
 * Controller to render the Shopping Cart
 */
const getCart = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const cartItems = await CartModel.getByUserId(userId);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal > 600 ? 50 : 0;
    const total = Math.max(0, subtotal + deliveryFee + tax - discount);

    res.render('pages/cart', {
      title: 'Your Shopping Cart – FoodExpress',
      cartItems,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        discount,
        total
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to add an item to Cart (supports both AJAX JSON and Form POST)
 */
const addToCart = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const { foodId, quantity } = req.body;

    const isJson = req.xhr || (req.headers.accept && req.headers.accept.includes('json'));
    if (!foodId) {
      if (isJson) {
        return res.status(400).json({ success: false, message: 'foodId is required' });
      }
      return res.redirect('/menu');
    }

    await CartModel.addItem(userId, foodId, quantity || 1);

    if (isJson) {
      const items = await CartModel.getByUserId(userId);
      const totalCount = items.reduce((acc, i) => acc + i.quantity, 0);
      return res.json({ success: true, cartCount: totalCount });
    }

    req.session.successMessage = 'Item added to your basket!';
    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to update quantity in Cart
 */
const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const { foodId, quantity } = req.body;

    await CartModel.updateQuantity(userId, foodId, quantity);

    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
      return res.json({ success: true });
    }

    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to remove an item from Cart
 */
const removeItem = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const { foodId } = req.body;

    await CartModel.removeItem(userId, foodId);

    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
      return res.json({ success: true });
    }

    res.redirect('/cart');
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to render the Checkout Page
 */
const getCheckout = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const cartItems = await CartModel.getByUserId(userId);

    if (cartItems.length === 0) {
      req.session.errorMessage = 'Your cart is empty. Add food items before checkout.';
      return res.redirect('/menu');
    }

    const user = req.session && req.session.user ? req.session.user : await UserModel.findById(1);

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 40;
    const tax = Math.round(subtotal * 0.05);
    const discount = subtotal > 600 ? 50 : 0;
    const total = Math.max(0, subtotal + deliveryFee + tax - discount);

    res.render('pages/checkout', {
      title: 'Checkout & Place Order – FoodExpress',
      cartItems,
      user,
      summary: {
        subtotal,
        deliveryFee,
        tax,
        discount,
        total
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeItem,
  getCheckout
};
