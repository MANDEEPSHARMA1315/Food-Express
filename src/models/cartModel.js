const { getPool, isMySQLConnected, memoryDb } = require('../config/db');

class CartModel {
  /**
   * Get user's cart items with joined food details
   */
  static async getByUserId(userId) {
    const uId = parseInt(userId, 10);
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT c.id, c.user_id, c.food_id, c.quantity,
               f.name, f.price, f.image, f.is_veg
        FROM cart c
        JOIN foods f ON c.food_id = f.id
        WHERE c.user_id = ?
        ORDER BY c.created_at ASC
      `, [uId]);
      return rows.map(r => ({
        id: r.id,
        foodId: r.food_id,
        name: r.name,
        price: parseFloat(r.price),
        image: r.image,
        isVeg: Boolean(r.is_veg),
        quantity: r.quantity,
        total: parseFloat(r.price) * r.quantity
      }));
    } else {
      const userCart = memoryDb.cart.filter(c => c.user_id === uId);
      return userCart.map(c => {
        const food = memoryDb.foods.find(f => f.id === c.food_id) || {};
        return {
          id: c.id,
          foodId: c.food_id,
          name: food.name || 'Dish',
          price: food.price || 0,
          image: food.image || '',
          isVeg: food.is_veg !== undefined ? food.is_veg : true,
          quantity: c.quantity,
          total: (food.price || 0) * c.quantity
        };
      });
    }
  }

  /**
   * Add item to cart or increment quantity if already present
   */
  static async addItem(userId, foodId, quantity = 1) {
    const uId = parseInt(userId, 10);
    const fId = parseInt(foodId, 10);
    const qty = parseInt(quantity, 10) || 1;

    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query(`
        INSERT INTO cart (user_id, food_id, quantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
      `, [uId, fId, qty]);
      return true;
    } else {
      const existing = memoryDb.cart.find(c => c.user_id === uId && c.food_id === fId);
      if (existing) {
        existing.quantity += qty;
      } else {
        memoryDb.cart.push({
          id: memoryDb.cart.length + 1,
          user_id: uId,
          food_id: fId,
          quantity: qty,
          created_at: new Date()
        });
      }
      return true;
    }
  }

  /**
   * Update quantity of an item in cart
   */
  static async updateQuantity(userId, foodId, quantity) {
    const uId = parseInt(userId, 10);
    const fId = parseInt(foodId, 10);
    const qty = parseInt(quantity, 10);

    if (qty <= 0) {
      return await this.removeItem(uId, fId);
    }

    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('UPDATE cart SET quantity = ? WHERE user_id = ? AND food_id = ?', [qty, uId, fId]);
      return true;
    } else {
      const item = memoryDb.cart.find(c => c.user_id === uId && c.food_id === fId);
      if (item) item.quantity = qty;
      return true;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId, foodId) {
    const uId = parseInt(userId, 10);
    const fId = parseInt(foodId, 10);

    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('DELETE FROM cart WHERE user_id = ? AND food_id = ?', [uId, fId]);
      return true;
    } else {
      const index = memoryDb.cart.findIndex(c => c.user_id === uId && c.food_id === fId);
      if (index !== -1) {
        memoryDb.cart.splice(index, 1);
        return true;
      }
      return false;
    }
  }

  /**
   * Clear all items from user's cart
   */
  static async clearCart(userId) {
    const uId = parseInt(userId, 10);
    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('DELETE FROM cart WHERE user_id = ?', [uId]);
      return true;
    } else {
      memoryDb.cart = memoryDb.cart.filter(c => c.user_id !== uId);
      return true;
    }
  }
}

module.exports = CartModel;
