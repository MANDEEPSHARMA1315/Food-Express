const { getPool, isMySQLConnected, memoryDb } = require('../config/db');

class FoodModel {
  /**
   * Get all foods with optional filters (category, search, diet)
   */
  static async getAll({ categorySlug, search, isVeg } = {}) {
    if (isMySQLConnected()) {
      const pool = getPool();
      let sql = `
        SELECT f.*, c.name AS category_name, c.slug AS category_slug
        FROM foods f
        JOIN categories c ON f.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (categorySlug && categorySlug !== 'all') {
        sql += ' AND c.slug = ?';
        params.push(categorySlug);
      }

      if (search && search.trim()) {
        sql += ' AND (LOWER(f.name) LIKE ? OR LOWER(f.description) LIKE ?)';
        params.push(`%${search.trim().toLowerCase()}%`, `%${search.trim().toLowerCase()}%`);
      }

      if (typeof isVeg === 'boolean') {
        sql += ' AND f.is_veg = ?';
        params.push(isVeg ? 1 : 0);
      }

      sql += ' ORDER BY f.is_popular DESC, f.id ASC';
      const [rows] = await pool.query(sql, params);
      return rows.map(r => ({
        ...r,
        price: parseFloat(r.price),
        originalPrice: r.original_price ? parseFloat(r.original_price) : null,
        category: r.category_name,
        categorySlug: r.category_slug,
        isVeg: Boolean(r.is_veg),
        isSpicy: Boolean(r.is_spicy),
        isPopular: Boolean(r.is_popular),
        deliveryTime: r.delivery_time,
        reviewsCount: r.reviews_count
      }));
    } else {
      let items = [...memoryDb.foods];

      if (categorySlug && categorySlug !== 'all') {
        items = items.filter(f => f.category_slug === categorySlug);
      }

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
      }

      if (typeof isVeg === 'boolean') {
        items = items.filter(f => f.is_veg === isVeg);
      }

      return items.map(f => ({
        ...f,
        category: f.category_name,
        categorySlug: f.category_slug,
        originalPrice: f.original_price,
        deliveryTime: f.delivery_time,
        reviewsCount: f.reviews_count,
        isVeg: f.is_veg,
        isSpicy: f.is_spicy,
        isPopular: f.is_popular
      }));
    }
  }

  /**
   * Find single food item by ID
   */
  static async findById(id) {
    const foodId = parseInt(id, 10);
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT f.*, c.name AS category_name, c.slug AS category_slug
        FROM foods f
        JOIN categories c ON f.category_id = c.id
        WHERE f.id = ?
        LIMIT 1
      `, [foodId]);
      if (!rows[0]) return null;
      const r = rows[0];
      return {
        ...r,
        price: parseFloat(r.price),
        originalPrice: r.original_price ? parseFloat(r.original_price) : null,
        category: r.category_name,
        categorySlug: r.category_slug,
        isVeg: Boolean(r.is_veg),
        isSpicy: Boolean(r.is_spicy),
        isPopular: Boolean(r.is_popular),
        deliveryTime: r.delivery_time,
        reviewsCount: r.reviews_count
      };
    } else {
      const f = memoryDb.foods.find(item => item.id === foodId);
      if (!f) return null;
      return {
        ...f,
        category: f.category_name,
        categorySlug: f.category_slug,
        originalPrice: f.original_price,
        deliveryTime: f.delivery_time,
        reviewsCount: f.reviews_count,
        isVeg: f.is_veg,
        isSpicy: f.is_spicy,
        isPopular: f.is_popular
      };
    }
  }

  /**
   * Create new food item (Admin)
   */
  static async create(data) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        `INSERT INTO foods (name, category_id, price, original_price, description, image, rating, reviews_count, delivery_time, calories, is_veg, is_spicy, is_popular)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.categoryId,
          data.price,
          data.originalPrice || null,
          data.description,
          data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
          data.rating || 4.8,
          data.reviewsCount || 100,
          data.deliveryTime || '25-30 min',
          data.calories || '550 kcal',
          data.isVeg ? 1 : 0,
          data.isSpicy ? 1 : 0,
          data.isPopular ? 1 : 0
        ]
      );
      return { id: result.insertId, ...data };
    } else {
      const newFood = {
        id: memoryDb.foods.length + 1,
        name: data.name,
        category_id: data.categoryId,
        category_name: data.categoryName || 'Dishes',
        category_slug: data.categorySlug || 'dishes',
        price: parseFloat(data.price),
        original_price: data.originalPrice ? parseFloat(data.originalPrice) : null,
        description: data.description,
        image: data.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
        rating: 4.8,
        reviews_count: 100,
        delivery_time: data.deliveryTime || '25-30 min',
        calories: data.calories || '550 kcal',
        is_veg: Boolean(data.isVeg),
        is_spicy: Boolean(data.isSpicy),
        is_popular: Boolean(data.isPopular),
        created_at: new Date()
      };
      memoryDb.foods.push(newFood);
      return newFood;
    }
  }

  /**
   * Delete food item (Admin)
   */
  static async delete(id) {
    const foodId = parseInt(id, 10);
    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('DELETE FROM foods WHERE id = ?', [foodId]);
      return true;
    } else {
      const index = memoryDb.foods.findIndex(f => f.id === foodId);
      if (index !== -1) {
        memoryDb.foods.splice(index, 1);
        return true;
      }
      return false;
    }
  }
}

module.exports = FoodModel;
