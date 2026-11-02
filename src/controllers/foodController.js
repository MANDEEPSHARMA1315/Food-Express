const CategoryModel = require('../models/categoryModel');
const FoodModel = require('../models/foodModel');

/**
 * Controller to list all foods with search and category filters
 */
const getMenu = async (req, res, next) => {
  try {
    const { category, search, diet } = req.query;

    let isVeg = undefined;
    if (diet === 'veg') isVeg = true;
    else if (diet === 'non-veg') isVeg = false;

    const rawCategories = await CategoryModel.getAll();
    const categories = [{ id: 0, name: 'All', icon: 'bi-grid-fill', slug: 'all', count: 0 }, ...rawCategories];

    const foods = await FoodModel.getAll({
      categorySlug: category,
      search,
      isVeg
    });

    res.render('pages/menu', {
      title: 'Explore Our Delicious Menu – FoodExpress',
      categories,
      foods,
      currentCategory: category || 'all',
      searchQuery: search || '',
      selectedDiet: diet || 'all'
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Controller to display single food details
 */
const getFoodDetails = async (req, res, next) => {
  try {
    const foodId = parseInt(req.params.id, 10);
    const food = await FoodModel.findById(foodId);

    if (!food) {
      return res.status(404).render('pages/404', {
        title: 'Food Item Not Found – FoodExpress',
        message: 'The requested food item does not exist or has been removed from the menu.'
      });
    }

    // Related foods in the same category
    const allCategoryFoods = await FoodModel.getAll({ categorySlug: food.categorySlug });
    const relatedFoods = allCategoryFoods.filter(item => item.id !== food.id).slice(0, 3);

    res.render('pages/food-details', {
      title: `${food.name} – FoodExpress`,
      food,
      relatedFoods
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMenu,
  getFoodDetails
};
