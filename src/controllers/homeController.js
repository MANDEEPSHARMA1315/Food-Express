const CategoryModel = require('../models/categoryModel');
const FoodModel = require('../models/foodModel');

/**
 * Controller for Homepage
 */
const getHomePage = async (req, res, next) => {
  try {
    const rawCategories = await CategoryModel.getAll();
    const categories = [{ id: 0, name: 'All', icon: 'bi-grid-fill', slug: 'all', count: 0 }, ...rawCategories];
    const allFoods = await FoodModel.getAll();
    const popularFoods = allFoods.filter(item => item.isPopular);
    const featuredFoods = allFoods.slice(0, 6);

    res.render('pages/index', {
      title: 'FoodExpress – Lightning Fast Food Delivery',
      categories,
      popularFoods,
      featuredFoods
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHomePage
};
