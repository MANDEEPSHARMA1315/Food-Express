const { getPool, isMySQLConnected, memoryDb } = require('../config/db');

class CategoryModel {
  /**
   * Get all categories with item counts
   */
  static async getAll() {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT c.*, COUNT(f.id) AS count
        FROM categories c
        LEFT JOIN foods f ON c.id = f.category_id
        GROUP BY c.id
        ORDER BY c.id ASC
      `);
      return rows;
    } else {
      return memoryDb.categories.map(c => {
        const count = memoryDb.foods.filter(f => f.category_id === c.id || f.category_slug === c.slug).length;
        return { ...c, count };
      });
    }
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
      return rows[0] || null;
    } else {
      return memoryDb.categories.find(c => c.slug === slug) || null;
    }
  }

  /**
   * Create a new category
   */
  static async create({ name, slug, icon = 'bi-grid-fill', image = null }) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO categories (name, slug, icon, image) VALUES (?, ?, ?, ?)',
        [name, slug, icon, image]
      );
      return { id: result.insertId, name, slug, icon, image };
    } else {
      const newCategory = {
        id: memoryDb.categories.length + 1,
        name,
        slug,
        icon,
        image,
        created_at: new Date()
      };
      memoryDb.categories.push(newCategory);
      return newCategory;
    }
  }
}

module.exports = CategoryModel;
