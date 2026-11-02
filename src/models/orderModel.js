const { getPool, isMySQLConnected, memoryDb } = require('../config/db');

class OrderModel {
  /**
   * Helper to determine status lifecycle step number (1 to 5)
   */
  static getStatusStep(status) {
    switch (status) {
      case 'Pending': return 1;
      case 'Confirmed': return 2;
      case 'Preparing': return 3;
      case 'Out for Delivery': return 4;
      case 'Delivered': return 5;
      case 'Cancelled': return 0;
      default: return 1;
    }
  }

  /**
   * Helper to determine status badge color
   */
  static getStatusColor(status) {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Out for Delivery': return 'primary';
      case 'Preparing': return 'warning';
      case 'Confirmed': return 'info';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  /**
   * Create an Order using ACID Database Transactions
   */
  static async createOrderTransaction({
    userId,
    items,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    deliveryAddress,
    phone,
    paymentMethod,
    notes = ''
  }) {
    const orderNumber = 'FE-' + Math.floor(1000 + Math.random() * 9000);

    if (isMySQLConnected()) {
      const pool = getPool();
      const connection = await pool.getConnection();

      try {
        // Begin ACID Database Transaction
        await connection.beginTransaction();

        // 1. Insert Master Order record
        const [orderResult] = await connection.query(
          `INSERT INTO orders 
           (order_number, user_id, subtotal, delivery_fee, tax, discount, total, status, delivery_address, phone, payment_method, notes, rider_name, rider_phone, rider_vehicle, estimated_delivery)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, 'Ramesh Verma', '+91 98765 43210', 'Hero Electric (MH 01 AB 4321)', '30 mins')`,
          [orderNumber, userId, subtotal, deliveryFee, tax, discount, total, deliveryAddress, phone, paymentMethod, notes]
        );

        const orderId = orderResult.insertId;

        // 2. Insert all Order Items atomically
        for (const item of items) {
          const itemTotal = item.price * item.quantity;
          await connection.query(
            `INSERT INTO order_items (order_id, food_id, food_name, price, quantity, total_price)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orderId, item.foodId, item.name, item.price, item.quantity, itemTotal]
          );
        }

        // 3. Clear user's shopping cart within the same transaction
        await connection.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        // Commit transaction
        await connection.commit();
        connection.release();

        return { orderId, orderNumber };
      } catch (err) {
        // Rollback transaction to maintain consistency
        await connection.rollback();
        connection.release();
        throw err;
      }
    } else {
      // In-Memory Transactional Simulation
      const newOrderId = memoryDb.orders.length + 1;
      const newOrder = {
        id: newOrderId,
        order_number: orderNumber,
        user_id: parseInt(userId, 10),
        subtotal: parseFloat(subtotal),
        delivery_fee: parseFloat(deliveryFee),
        tax: parseFloat(tax),
        discount: parseFloat(discount),
        total: parseFloat(total),
        status: 'Pending',
        status_step: 1,
        status_color: 'secondary',
        delivery_address: deliveryAddress,
        phone,
        payment_method: paymentMethod,
        notes,
        rider_name: 'Ramesh Verma',
        rider_phone: '+91 98765 43210',
        rider_vehicle: 'Hero Electric (MH 01 AB 4321)',
        estimated_delivery: '30 mins',
        created_at: new Date()
      };

      memoryDb.orders.unshift(newOrder);

      items.forEach(item => {
        memoryDb.orderItems.push({
          id: memoryDb.orderItems.length + 1,
          order_id: newOrderId,
          food_id: item.foodId,
          food_name: item.name,
          price: item.price,
          quantity: item.quantity,
          total_price: item.price * item.quantity
        });
      });

      // Clear user cart
      memoryDb.cart = memoryDb.cart.filter(c => c.user_id !== parseInt(userId, 10));

      return { orderId: newOrderId, orderNumber };
    }
  }

  /**
   * Get orders by User ID
   */
  static async getByUserId(userId) {
    const uId = parseInt(userId, 10);
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [uId]
      );

      const ordersWithItems = [];
      for (const row of rows) {
        const [itemRows] = await pool.query(
          'SELECT * FROM order_items WHERE order_id = ?',
          [row.id]
        );
        ordersWithItems.push({
          ...row,
          id: row.order_number,
          orderId: row.id,
          date: new Date(row.created_at).toISOString().split('T')[0],
          statusStep: this.getStatusStep(row.status),
          statusColor: this.getStatusColor(row.status),
          itemCount: itemRows.reduce((acc, i) => acc + i.quantity, 0),
          items: itemRows.map(i => ({ name: i.food_name, qty: i.quantity, price: parseFloat(i.price) })),
          subtotal: parseFloat(row.subtotal),
          deliveryFee: parseFloat(row.delivery_fee),
          tax: parseFloat(row.tax),
          discount: parseFloat(row.discount),
          total: parseFloat(row.total),
          deliveryAddress: row.delivery_address,
          paymentMethod: row.payment_method,
          estimatedDelivery: row.estimated_delivery,
          rider: {
            name: row.rider_name,
            phone: row.rider_phone,
            vehicle: row.rider_vehicle
          }
        });
      }
      return ordersWithItems;
    } else {
      const userOrders = memoryDb.orders.filter(o => o.user_id === uId);
      return userOrders.map(o => {
        const items = memoryDb.orderItems
          .filter(i => i.order_id === o.id)
          .map(i => ({ name: i.food_name, qty: i.quantity, price: i.price }));
        return {
          ...o,
          id: o.order_number,
          orderId: o.id,
          date: new Date(o.created_at).toISOString().split('T')[0],
          statusStep: this.getStatusStep(o.status),
          statusColor: this.getStatusColor(o.status),
          itemCount: items.reduce((acc, i) => acc + i.qty, 0),
          items,
          subtotal: o.subtotal,
          deliveryFee: o.delivery_fee,
          tax: o.tax,
          discount: o.discount,
          total: o.total,
          deliveryAddress: o.delivery_address,
          paymentMethod: o.payment_method,
          estimatedDelivery: o.estimated_delivery,
          rider: {
            name: o.rider_name,
            phone: o.rider_phone,
            vehicle: o.rider_vehicle
          }
        };
      });
    }
  }

  /**
   * Find order by Order Number (e.g. FE-8921)
   */
  static async getByOrderNumber(orderNumber) {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT * FROM orders WHERE order_number = ? LIMIT 1',
        [orderNumber]
      );
      if (!rows[0]) return null;
      const row = rows[0];
      const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [row.id]);
      return {
        ...row,
        id: row.order_number,
        orderId: row.id,
        date: new Date(row.created_at).toISOString().split('T')[0],
        statusStep: this.getStatusStep(row.status),
        statusColor: this.getStatusColor(row.status),
        itemCount: itemRows.reduce((acc, i) => acc + i.quantity, 0),
        items: itemRows.map(i => ({ name: i.food_name, qty: i.quantity, price: parseFloat(i.price) })),
        subtotal: parseFloat(row.subtotal),
        deliveryFee: parseFloat(row.delivery_fee),
        tax: parseFloat(row.tax),
        discount: parseFloat(row.discount),
        total: parseFloat(row.total),
        deliveryAddress: row.delivery_address,
        paymentMethod: row.payment_method,
        estimatedDelivery: row.estimated_delivery,
        rider: {
          name: row.rider_name,
          phone: row.rider_phone,
          vehicle: row.rider_vehicle
        }
      };
    } else {
      const o = memoryDb.orders.find(ord => ord.order_number === orderNumber);
      if (!o) return null;
      const items = memoryDb.orderItems
        .filter(i => i.order_id === o.id)
        .map(i => ({ name: i.food_name, qty: i.quantity, price: i.price }));
      return {
        ...o,
        id: o.order_number,
        orderId: o.id,
        date: new Date(o.created_at).toISOString().split('T')[0],
        statusStep: this.getStatusStep(o.status),
        statusColor: this.getStatusColor(o.status),
        itemCount: items.reduce((acc, i) => acc + i.qty, 0),
        items,
        subtotal: o.subtotal,
        deliveryFee: o.delivery_fee,
        tax: o.tax,
        discount: o.discount,
        total: o.total,
        deliveryAddress: o.delivery_address,
        paymentMethod: o.payment_method,
        estimatedDelivery: o.estimated_delivery,
        rider: {
          name: o.rider_name,
          phone: o.rider_phone,
          vehicle: o.rider_vehicle
        }
      };
    }
  }

  /**
   * Get all orders (for Admin Panel)
   */
  static async getAllOrders() {
    if (isMySQLConnected()) {
      const pool = getPool();
      const [rows] = await pool.query(`
        SELECT o.*, u.name AS customer_name, u.email AS customer_email
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
      `);

      const all = [];
      for (const row of rows) {
        const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [row.id]);
        all.push({
          ...row,
          id: row.order_number,
          orderId: row.id,
          customer: row.customer_name,
          customerEmail: row.customer_email,
          date: new Date(row.created_at).toLocaleString(),
          statusStep: this.getStatusStep(row.status),
          statusColor: this.getStatusColor(row.status),
          items: itemRows.map(i => ({ name: i.food_name, qty: i.quantity, price: parseFloat(i.price) })),
          itemsSummary: itemRows.map(i => `${i.food_name} (${i.quantity})`).join(', '),
          total: parseFloat(row.total),
          deliveryAddress: row.delivery_address
        });
      }
      return all;
    } else {
      return memoryDb.orders.map(o => {
        const user = memoryDb.users.find(u => u.id === o.user_id) || {};
        const items = memoryDb.orderItems
          .filter(i => i.order_id === o.id)
          .map(i => ({ name: i.food_name, qty: i.quantity, price: i.price }));
        return {
          ...o,
          id: o.order_number,
          orderId: o.id,
          customer: user.name || 'Akant Sharma',
          customerEmail: user.email || 'customer@foodexpress.com',
          date: new Date(o.created_at).toLocaleDateString(),
          statusStep: this.getStatusStep(o.status),
          statusColor: this.getStatusColor(o.status),
          items,
          itemsSummary: items.map(i => `${i.name} (${i.qty})`).join(', '),
          total: o.total,
          deliveryAddress: o.delivery_address
        };
      });
    }
  }

  /**
   * Update order status (Admin)
   */
  static async updateStatus(orderNumber, newStatus) {
    if (isMySQLConnected()) {
      const pool = getPool();
      await pool.query('UPDATE orders SET status = ? WHERE order_number = ?', [newStatus, orderNumber]);
      return true;
    } else {
      const order = memoryDb.orders.find(o => o.order_number === orderNumber);
      if (order) {
        order.status = newStatus;
        order.status_step = this.getStatusStep(newStatus);
        order.status_color = this.getStatusColor(newStatus);
        return true;
      }
      return false;
    }
  }
}

module.exports = OrderModel;
