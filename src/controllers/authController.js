const UserModel = require('../models/userModel');
const OrderModel = require('../models/orderModel');

/**
 * Render Login Page
 */
const getLogin = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(req.session.user.role === 'admin' ? '/admin' : '/profile');
  }
  res.render('pages/login', {
    title: 'Login to FoodExpress – Fast & Fresh Food Delivery',
    redirect: req.query.redirect || '/'
  });
};

/**
 * Handle Login Form Submission
 */
const postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.session.errorMessage = 'Please provide both email and password.';
      return res.redirect('/login');
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      req.session.errorMessage = 'Invalid email or password.';
      return res.redirect('/login');
    }

    const isMatch = await UserModel.comparePassword(password, user.password);
    if (!isMatch) {
      req.session.errorMessage = 'Invalid email or password.';
      return res.redirect('/login');
    }

    // Save user session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      memberSince: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'October 2026'
    };

    req.session.successMessage = `Welcome back, ${user.name}!`;

    const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/profile');
    delete req.session.returnTo;
    res.redirect(returnTo);
  } catch (err) {
    next(err);
  }
};

/**
 * Render Registration Page
 */
const getRegister = (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/profile');
  }
  res.render('pages/register', {
    title: 'Create Your Account – FoodExpress'
  });
};

/**
 * Handle User Registration
 */
const postRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      req.session.errorMessage = 'Name, email, and password are required.';
      return res.redirect('/register');
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      req.session.errorMessage = 'An account with this email address already exists. Please log in.';
      return res.redirect('/login');
    }

    const newUser = await UserModel.create({
      name,
      email,
      password,
      phone: phone || '',
      address: 'Please set your delivery address in your profile',
      role: 'customer'
    });

    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      memberSince: 'Just now'
    };

    req.session.successMessage = 'Your account has been created successfully! Welcome to FoodExpress.';
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
};

/**
 * Render Customer Profile / Dashboard
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.session && req.session.user ? req.session.user.id : 1;
    const user = req.session && req.session.user ? req.session.user : await UserModel.findById(userId);
    const recentOrders = await OrderModel.getByUserId(userId);

    res.render('pages/profile', {
      title: 'Customer Dashboard – FoodExpress',
      user: user || {
        name: 'Akant Sharma',
        email: 'customer@foodexpress.com',
        phone: '+91 98765 43210',
        address: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
        memberSince: 'October 2026'
      },
      recentOrders: recentOrders.slice(0, 3)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle User Logout
 */
const logout = (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  } else {
    res.redirect('/');
  }
};

module.exports = {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  getProfile,
  logout
};
