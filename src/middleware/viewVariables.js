const config = require('../config');
const CartModel = require('../models/cartModel');

/**
 * Middleware to pass global variables, session state, and cart counts to all EJS templates
 */
const viewVariables = async (req, res, next) => {
  res.locals.appName = config.appName;
  res.locals.appUrl = config.appUrl;
  res.locals.currentPath = req.path;
  
  // Real session user
  res.locals.currentUser = req.session ? req.session.user : null;

  // Flash notifications
  res.locals.successMessage = req.session && req.session.successMessage ? req.session.successMessage : null;
  res.locals.errorMessage = req.session && req.session.errorMessage ? req.session.errorMessage : null;
  if (req.session) {
    delete req.session.successMessage;
    delete req.session.errorMessage;
  }

  // Live cart counter
  try {
    if (req.session && req.session.user) {
      const items = await CartModel.getByUserId(req.session.user.id);
      res.locals.cartCount = items.reduce((acc, i) => acc + i.quantity, 0);
    } else {
      res.locals.cartCount = 0;
    }
  } catch (err) {
    res.locals.cartCount = 0;
  }

  next();
};

module.exports = viewVariables;
