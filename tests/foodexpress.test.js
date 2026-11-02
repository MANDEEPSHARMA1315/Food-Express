const request = require('supertest');
const app = require('../src/app');

describe('FoodExpress Automated Test Suite (Jest & Supertest)', () => {
  let customerAgent;
  let adminAgent;

  beforeAll(() => {
    customerAgent = request.agent(app);
    adminAgent = request.agent(app);
  });

  // 1. Food Listing & Menu Exploration
  describe('GET / and /menu (Food Catalog)', () => {
    it('should return 200 OK and render homepage with dishes', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('FoodExpress');
    });

    it('should return 200 OK and list foods on /menu', async () => {
      const res = await request(app).get('/menu');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Gourmet Menu');
    });

    it('should support searching dishes by keyword', async () => {
      const res = await request(app).get('/menu?search=burger');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Burger');
    });

    it('should filter dishes by category', async () => {
      const res = await request(app).get('/menu?category=pizza');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Pizza');
    });

    it('should return 200 OK for a single food item details', async () => {
      const res = await request(app).get('/food/1');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Classic Smash Cheeseburger');
    });
  });

  // 2. User Registration
  describe('POST /register (User Registration)', () => {
    it('should register a new user and redirect to profile', async () => {
      const testEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/register')
        .send({
          name: 'MCA Test User',
          email: testEmail,
          phone: '+91 99887 76655',
          password: 'Password@123'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/profile');
    });

    it('should fail registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/register')
        .send({ name: 'Incomplete' });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/register');
    });
  });

  // 3. User Login & Password Verification
  describe('POST /login (Authentication with bcrypt)', () => {
    it('should log in customer using seeded demo credentials', async () => {
      const res = await customerAgent
        .post('/login')
        .send({
          email: 'customer@foodexpress.com',
          password: 'Customer@123'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/profile');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'customer@foodexpress.com',
          password: 'WrongPassword'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/login');
    });
  });

  // 4. Shopping Cart Functionality
  describe('Cart Operations (/cart)', () => {
    it('should add food item to cart', async () => {
      const res = await customerAgent
        .post('/cart/add')
        .send({ foodId: 2, quantity: 2 });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/cart');
    });

    it('should render cart with calculated pricing', async () => {
      const res = await customerAgent.get('/cart');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Order Summary');
    });

    it('should update item quantity in cart', async () => {
      const res = await customerAgent
        .post('/cart/update')
        .send({ foodId: 2, quantity: 4 });

      expect(res.statusCode).toBe(302);
    });

    it('should remove item from cart', async () => {
      const res = await customerAgent
        .post('/cart/remove')
        .send({ foodId: 2 });

      expect(res.statusCode).toBe(302);
    });
  });

  // 5. Order Placement (ACID Transaction)
  describe('POST /checkout (Order Placement)', () => {
    it('should place an order and redirect to live tracking', async () => {
      // Ensure at least one item in cart
      await customerAgent.post('/cart/add').send({ foodId: 1, quantity: 1 });

      const res = await customerAgent
        .post('/checkout')
        .send({
          name: 'Akant Sharma',
          phone: '+91 98765 43210',
          address: 'Room 201, MCA Hostels, Campus Road',
          paymentMethod: 'Cash on Delivery',
          notes: 'Deliver hot please'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toMatch(/\/orders\/track\/FE-/);
    });

    it('should render customer orders list', async () => {
      const res = await customerAgent.get('/orders');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('My Orders');
    });
  });

  // 6. Admin Authorization & Lifecycle Updates
  describe('Admin Portal (/admin)', () => {
    it('should render admin dashboard', async () => {
      const res = await request(app).get('/admin');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Admin Console');
    });

    it('should render admin orders management page', async () => {
      const res = await request(app).get('/admin/orders');
      expect(res.statusCode).toBe(200);
      expect(res.text).toContain('Customer Orders Management');
    });

    it('should update order status through lifecycle stages', async () => {
      const res = await request(app)
        .post('/admin/orders/status')
        .send({
          orderNumber: 'FE-8921',
          status: 'Preparing'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/admin/orders');
    });

    it('should add a new food item through admin portal', async () => {
      const res = await request(app)
        .post('/admin/foods/add')
        .send({
          name: 'Truffle Macaroni Bake',
          categoryId: 1,
          price: 269,
          originalPrice: 319,
          dietType: 'veg',
          description: 'Creamy macaroni loaded with truffle oil and sharp cheddar.'
        });

      expect(res.statusCode).toBe(302);
      expect(res.headers.location).toBe('/admin/foods');
    });
  });
});
