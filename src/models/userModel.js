const { getPool, isMySQLConnected, memoryDb } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email.toLowerCase().trim()]);
      return rows[0] || null;
    } else {
      return memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
      return rows[0] || null;
    } else {
      return memoryDb.users.find(u => u.id === parseInt(id, 10)) || null;
    }
  }

  /**
   * Create a new user (with bcrypt password hashing)
   */
  static async create({ name, email, password, phone, address, role = 'customer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMySQLConnected()) {
      const pool = getPool();
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email.toLowerCase().trim(), hashedPassword, phone, address, role]
      );
      return { id: result.insertId, name, email, phone, address, role };
    } else {
      const newUser = {
        id: memoryDb.users.length + 1,
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        phone,
        address,
        role,
        created_at: new Date()
      };
      memoryDb.users.push(newUser);
      return newUser;
    }
  }

  /**
   * Get all registered customers (for Admin dashboard)
   */
  static async getAll() {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query('SELECT id, name, email, phone, address, role, created_at FROM users ORDER BY created_at DESC');
      return rows;
    } else {
      return memoryDb.users.map(({ password, ...rest }) => rest);
    }
  }

  /**
   * Compare plain password with bcrypt hash
   */
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
