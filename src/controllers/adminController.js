const OrderModel = require('../models/orderModel');
const FoodModel = require('../models/foodModel');
const CategoryModel = require('../models/categoryModel');
const UserModel = require('../models/userModel');

/**
 * Render Admin Dashboard with Live Aggregated Analytics
 */
const getDashboard = async (req, res, next) => {
  try {
    const orders = await OrderModel.getAllOrders();
    const foods = await FoodModel.getAll();
    const categories = await CategoryModel.getAll();
    const users = await UserModel.getAll();

    const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'Cancelled' ? o.total : 0), 0);

    const stats = {
      totalRevenue,
      totalOrders: orders.length,
      activeMenuItems: foods.length,
      totalCustomers: users.length,
      recentOrders: orders.slice(0, 5)
    };

    res.render('admin/dashboard', {
      title: 'Admin Dashboard – FoodExpress Portal',
      stats,
      foodsCount: foods.length,
      categoriesCount: categories.length
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Render Admin Orders Management
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.getAllOrders();

    res.render('admin/orders', {
      title: 'Manage Customer Orders – FoodExpress Admin',
      orders
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Order Status Update (Pending, Confirmed, Preparing, Out for Delivery, Delivered, Cancelled)
 */
const postUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderNumber, status } = req.body;
    await OrderModel.updateStatus(orderNumber, status);

    if (req.xhr || (req.headers.accept && req.headers.accept.includes('json'))) {
      return res.json({ success: true, message: `Order #${orderNumber} updated to ${status}` });
    }

    req.session.successMessage = `Order #${orderNumber} status changed to ${status}`;
    res.redirect('/admin/orders');
  } catch (err) {
    next(err);
  }
};

/**
 * Render Admin Foods Management
 */
const getFoods = async (req, res, next) => {
  try {
    const foods = await FoodModel.getAll();
    const categories = await CategoryModel.getAll();

    res.render('admin/foods', {
      title: 'Manage Food Items – FoodExpress Admin',
      foods,
      categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Creating a New Food Item
 */
const postAddFood = async (req, res, next) => {
  try {
    const { name, categoryId, price, originalPrice, description, image, dietType } = req.body;

    await FoodModel.create({
      name,
      categoryId: parseInt(categoryId, 10) || 1,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description,
      image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
      isVeg: dietType === 'veg',
      isSpicy: false,
      isPopular: false
    });

    req.session.successMessage = `Food item "${name}" created successfully!`;
    res.redirect('/admin/foods');
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Deleting a Food Item
 */
const postDeleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    await FoodModel.delete(id);

    req.session.successMessage = 'Food item removed successfully.';
    res.redirect('/admin/foods');
  } catch (err) {
    next(err);
  }
};

/**
 * Render Admin Categories Management
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await CategoryModel.getAll();

    res.render('admin/categories', {
      title: 'Manage Categories – FoodExpress Admin',
      categories
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle Creating a New Category
 */
const postAddCategory = async (req, res, next) => {
  try {
    const { name, slug, icon } = req.body;
    await CategoryModel.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      icon: icon || 'bi-grid-fill'
    });

    req.session.successMessage = `Category "${name}" created successfully!`;
    res.redirect('/admin/categories');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getOrders,
  postUpdateOrderStatus,
  getFoods,
  postAddFood,
  postDeleteFood,
  getCategories,
  postAddCategory
};
