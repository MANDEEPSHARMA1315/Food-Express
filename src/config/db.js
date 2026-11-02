const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./index');
const { categories: seedCategories, foods: seedFoods, mockOrders: seedOrders } = require('../data/mockData');

let pool = null;
let useMySQL = false;

// In-Memory Database Store (Used when MySQL server is offline or during testing)
const memoryDb = {
  users: [],
  categories: [],
  foods: [],
  cart: [],
  orders: [],
  orderItems: []
};

// Seed initial memory store
async function seedMemoryDatabase() {
  const customerPassword = await bcrypt.hash('Customer@123', 10);
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  memoryDb.users = [
    {
      id: 1,
      name: 'Akant Sharma',
      email: 'customer@foodexpress.com',
      password: customerPassword,
      phone: '+91 98765 43210',
      address: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
      role: 'customer',
      created_at: new Date()
    },
    {
      id: 2,
      name: 'System Administrator',
      email: 'admin@foodexpress.com',
      password: adminPassword,
      phone: '+91 99999 88888',
      address: 'FoodExpress HQ, Tech Park, Mumbai',
      role: 'admin',
      created_at: new Date()
    }
  ];

  memoryDb.categories = seedCategories.slice(1).map((c, idx) => ({
    id: idx + 1,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    image: c.image || null,
    created_at: new Date()
  }));

  memoryDb.foods = seedFoods.map((f, idx) => {
    const cat = memoryDb.categories.find(c => c.slug === f.categorySlug);
    return {
      id: f.id,
      name: f.name,
      category_id: cat ? cat.id : 1,
      category_name: f.category,
      category_slug: f.categorySlug,
      price: f.price,
      original_price: f.originalPrice,
      description: f.description,
      image: f.image,
      rating: f.rating,
      reviews_count: f.reviewsCount,
      delivery_time: f.deliveryTime,
      calories: f.calories,
      is_veg: f.isVeg,
      is_spicy: f.isSpicy,
      is_popular: f.isPopular,
      created_at: new Date()
    };
  });

  // Seed initial cart for Customer (User ID 1)
  memoryDb.cart = [
    { id: 1, user_id: 1, food_id: 1, quantity: 2, created_at: new Date() },
    { id: 2, user_id: 1, food_id: 4, quantity: 1, created_at: new Date() },
    { id: 3, user_id: 1, food_id: 11, quantity: 1, created_at: new Date() }
  ];

  // Seed sample orders
  memoryDb.orders = seedOrders.map((o, idx) => ({
    id: idx + 1,
    order_number: o.id,
    user_id: 1,
    subtotal: o.subtotal,
    delivery_fee: o.deliveryFee,
    tax: o.tax,
    discount: o.discount,
    total: o.total,
    status: o.status,
    status_step: o.statusStep,
    status_color: o.statusColor,
    delivery_address: o.deliveryAddress,
    phone: '+91 98765 43210',
    payment_method: o.paymentMethod,
    rider_name: o.rider ? o.rider.name : 'Ramesh Verma',
    rider_phone: o.rider ? o.rider.phone : '+91 98765 43210',
    rider_vehicle: o.rider ? o.rider.vehicle : 'Hero Electric (MH 01 AB 4321)',
    estimated_delivery: o.estimatedDelivery,
    created_at: new Date(o.date)
  }));

  memoryDb.orderItems = [
    { id: 1, order_id: 1, food_id: 1, food_name: 'Classic Smash Cheeseburger', price: 199, quantity: 2, total_price: 398 },
    { id: 2, order_id: 1, food_id: 4, food_name: 'Artisan Margherita Pizza', price: 349, quantity: 1, total_price: 349 }
  ];
}

/**
 * Initialize Database Connection and Auto-Migrate
 */
async function initDatabase() {
  await seedMemoryDatabase();

  try {
    // Attempt connecting to MySQL (e.g. in Docker Compose or Local Service)
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 2000
    });

    const connection = await pool.getConnection();
    console.log(`✅ MySQL Connected Successfully! [Host: ${config.db.host}:${config.db.port}, DB: ${config.db.database}]`);
    useMySQL = true;

    // Run schema creation if tables don't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) DEFAULT 'bi-grid-fill',
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS foods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category_id INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        description TEXT,
        image VARCHAR(255),
        rating DECIMAL(2,1) DEFAULT 4.8,
        reviews_count INT DEFAULT 150,
        delivery_time VARCHAR(50) DEFAULT '25-30 min',
        calories VARCHAR(50) DEFAULT '550 kcal',
        is_veg BOOLEAN DEFAULT TRUE,
        is_spicy BOOLEAN DEFAULT FALSE,
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        food_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_food (user_id, food_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        user_id INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total DECIMAL(10,2) NOT NULL,
        status ENUM('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
        delivery_address TEXT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'Cash on Delivery',
        notes TEXT,
        rider_name VARCHAR(100) DEFAULT 'Ramesh Verma',
        rider_phone VARCHAR(20) DEFAULT '+91 98765 43210',
        rider_vehicle VARCHAR(100) DEFAULT 'Hero Electric (MH 01 AB 4321)',
        estimated_delivery VARCHAR(50) DEFAULT '25-30 mins',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        food_id INT,
        food_name VARCHAR(150) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check if initial users exist in MySQL
    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count === 0) {
      console.log('🌱 Seeding initial MySQL database tables...');
      for (const u of memoryDb.users) {
        await connection.query(
          'INSERT INTO users (id, name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [u.id, u.name, u.email, u.password, u.phone, u.address, u.role]
        );
      }
      for (const c of memoryDb.categories) {
        await connection.query(
          'INSERT INTO categories (id, name, slug, icon, image) VALUES (?, ?, ?, ?, ?)',
          [c.id, c.name, c.slug, c.icon, c.image]
        );
      }
      for (const f of memoryDb.foods) {
        await connection.query(
          `INSERT INTO foods (id, name, category_id, price, original_price, description, image, rating, reviews_count, delivery_time, calories, is_veg, is_spicy, is_popular) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [f.id, f.name, f.category_id, f.price, f.original_price, f.description, f.image, f.rating, f.reviews_count, f.delivery_time, f.calories, f.is_veg, f.is_spicy, f.is_popular]
        );
      }
      console.log('✅ MySQL Database successfully seeded with categories, foods, and users!');
    }

    connection.release();
  } catch (err) {
    useMySQL = false;
    console.log(`ℹ️  Note: MySQL offline or not yet reachable (${err.message}).`);
    console.log(`🚀 Using Built-in Unified In-Memory Data Store so the entire app runs instantly without errors!`);
  }
}

module.exports = {
  initDatabase,
  getPool: () => pool,
  isMySQLConnected: () => useMySQL,
  memoryDb
};
