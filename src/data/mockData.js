/**
 * Mock Data for FoodExpress Phase 1
 * Represents our initial database seed for categories, foods, orders, and stats.
 */

const categories = [
  { id: 1, name: 'All', icon: 'bi-grid-fill', slug: 'all', count: 12 },
  { id: 2, name: 'Burgers', icon: 'bi-cup-hot-fill', slug: 'burgers', count: 3, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80' },
  { id: 3, name: 'Pizza', icon: 'bi-pie-chart-fill', slug: 'pizza', count: 3, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80' },
  { id: 4, name: 'Biryani & Bowls', icon: 'bi-bowl-fill', slug: 'biryani', count: 2, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80' },
  { id: 5, name: 'Healthy Salads', icon: 'bi-flower1', slug: 'salads', count: 2, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80' },
  { id: 6, name: 'Desserts', icon: 'bi-cake2-fill', slug: 'desserts', count: 2, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80' }
];

const foods = [
  {
    id: 1,
    name: 'Classic Smash Cheeseburger',
    category: 'Burgers',
    categorySlug: 'burgers',
    price: 199,
    originalPrice: 249,
    description: 'Double grilled smash patties loaded with molten cheddar cheese, caramelized onions, crisp lettuce, and signature smoky mayo on toasted brioche.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 320,
    deliveryTime: '25-30 min',
    calories: '650 kcal',
    isVeg: false,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 2,
    name: 'Spicy Paneer Tikka Burger',
    category: 'Burgers',
    categorySlug: 'burgers',
    price: 179,
    originalPrice: 219,
    description: 'Tandoori-marinated cottage cheese patty roasted over flame, mint coriander chutney, sliced red onions, and crunchy iceberg lettuce.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    reviewsCount: 210,
    deliveryTime: '20-25 min',
    calories: '520 kcal',
    isVeg: true,
    isSpicy: true,
    isPopular: true
  },
  {
    id: 3,
    name: 'Crispy BBQ Bacon Burger',
    category: 'Burgers',
    categorySlug: 'burgers',
    price: 249,
    originalPrice: 299,
    description: '100% Angus beef patty topped with smoked applewood bacon, crisp onion rings, cheddar cheese, and tangy Kansas-style barbecue glaze.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 450,
    deliveryTime: '30-35 min',
    calories: '780 kcal',
    isVeg: false,
    isSpicy: false,
    isPopular: false
  },
  {
    id: 4,
    name: 'Artisan Margherita Pizza',
    category: 'Pizza',
    categorySlug: 'pizza',
    price: 349,
    originalPrice: 399,
    description: 'Hand-stretched sourdough crust topped with San Marzano tomato sauce, fresh buffalo mozzarella, fragrant Genovese basil, and extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 512,
    deliveryTime: '30-40 min',
    calories: '820 kcal',
    isVeg: true,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 5,
    name: 'Double Pepperoni Feast',
    category: 'Pizza',
    categorySlug: 'pizza',
    price: 449,
    originalPrice: 499,
    description: 'Loaded with a double layer of spicy cured pepperoni slices, stretchy mozzarella, crushed red pepper flakes, and oregano garlic crust.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 390,
    deliveryTime: '30-35 min',
    calories: '950 kcal',
    isVeg: false,
    isSpicy: true,
    isPopular: true
  },
  {
    id: 6,
    name: 'Farmhouse Veggie Supreme',
    category: 'Pizza',
    categorySlug: 'pizza',
    price: 379,
    originalPrice: 429,
    description: 'Crispy bell peppers, sweet corn kernels, button mushrooms, black Spanish olives, and diced red onions over zesty herb tomato puree.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewsCount: 180,
    deliveryTime: '25-30 min',
    calories: '740 kcal',
    isVeg: true,
    isSpicy: false,
    isPopular: false
  },
  {
    id: 7,
    name: 'Royal Hyderabadi Dum Biryani',
    category: 'Biryani & Bowls',
    categorySlug: 'biryani',
    price: 329,
    originalPrice: 389,
    description: 'Aromatic long-grain basmati rice cooked in slow dum style with tender marinated chicken, saffron milk, caramelized birista, and whole spices. Served with raita.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 680,
    deliveryTime: '35-45 min',
    calories: '790 kcal',
    isVeg: false,
    isSpicy: true,
    isPopular: true
  },
  {
    id: 8,
    name: 'Nawabi Paneer Dum Biryani',
    category: 'Biryani & Bowls',
    categorySlug: 'biryani',
    price: 289,
    originalPrice: 339,
    description: 'Fragrant basmati layered with succulent cottage cheese cubes infused in royal Lucknowi spices, ghee, fresh mint, and toasted cashews.',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 290,
    deliveryTime: '30-40 min',
    calories: '680 kcal',
    isVeg: true,
    isSpicy: true,
    isPopular: false
  },
  {
    id: 9,
    name: 'Mediterranean Quinoa Greek Salad',
    category: 'Healthy Salads',
    categorySlug: 'salads',
    price: 249,
    originalPrice: 289,
    description: 'Organic fluffy quinoa, fresh cucumbers, cherry tomatoes, Kalamata olives, creamy feta cheese crumbles, and lemon-oregano vinaigrette.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewsCount: 140,
    deliveryTime: '15-20 min',
    calories: '340 kcal',
    isVeg: true,
    isSpicy: false,
    isPopular: false
  },
  {
    id: 10,
    name: 'Grilled Herb Chicken Avocado Bowl',
    category: 'Healthy Salads',
    categorySlug: 'salads',
    price: 299,
    originalPrice: 349,
    description: 'Rosemary-grilled chicken breast fillets, ripe sliced Hass avocado, baby spinach, roasted pumpkin seeds, and honey mustard dressing.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewsCount: 220,
    deliveryTime: '20-25 min',
    calories: '450 kcal',
    isVeg: false,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 11,
    name: 'Molten Belgian Chocolate Lava Cake',
    category: 'Desserts',
    categorySlug: 'desserts',
    price: 169,
    originalPrice: 199,
    description: 'Warm dark chocolate sponge cake with an irresistible flowing core of melted Belgian chocolate ganache, dusted with powdered sugar.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 540,
    deliveryTime: '15-20 min',
    calories: '420 kcal',
    isVeg: true,
    isSpicy: false,
    isPopular: true
  },
  {
    id: 12,
    name: 'New York Baked Berry Cheesecake',
    category: 'Desserts',
    categorySlug: 'desserts',
    price: 189,
    originalPrice: 229,
    description: 'Velvety smooth cream cheese baked over a buttery graham cracker crust, topped with homemade wild raspberry and blueberry coulis.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewsCount: 310,
    deliveryTime: '15-20 min',
    calories: '490 kcal',
    isVeg: true,
    isSpicy: false,
    isPopular: true
  }
];

const mockCart = [
  {
    foodId: 1,
    name: 'Classic Smash Cheeseburger',
    price: 199,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    isVeg: false
  },
  {
    foodId: 4,
    name: 'Artisan Margherita Pizza',
    price: 349,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    isVeg: true
  },
  {
    foodId: 11,
    name: 'Molten Belgian Chocolate Lava Cake',
    price: 169,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    isVeg: true
  }
];

const mockOrders = [
  {
    id: 'FE-8921',
    date: '2026-11-01',
    status: 'Out for Delivery',
    statusStep: 4, // 1: Pending, 2: Confirmed, 3: Preparing, 4: Out for Delivery, 5: Delivered
    statusColor: 'primary',
    items: [
      { name: 'Classic Smash Cheeseburger', qty: 2, price: 199 },
      { name: 'Artisan Margherita Pizza', qty: 1, price: 349 }
    ],
    itemCount: 3,
    subtotal: 747,
    deliveryFee: 40,
    tax: 37,
    discount: 50,
    total: 774,
    deliveryAddress: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
    paymentMethod: 'UPI / Online',
    estimatedDelivery: '30 mins',
    rider: {
      name: 'Ramesh Verma',
      phone: '+91 98765 43210',
      vehicle: 'Hero Electric (MH 01 AB 4321)'
    }
  },
  {
    id: 'FE-8742',
    date: '2026-10-28',
    status: 'Delivered',
    statusStep: 5,
    statusColor: 'success',
    items: [
      { name: 'Royal Hyderabadi Dum Biryani', qty: 2, price: 329 },
      { name: 'Molten Belgian Chocolate Lava Cake', qty: 2, price: 169 }
    ],
    itemCount: 4,
    subtotal: 996,
    deliveryFee: 40,
    tax: 50,
    discount: 100,
    total: 986,
    deliveryAddress: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
    paymentMethod: 'Cash on Delivery',
    estimatedDelivery: 'Delivered at 8:45 PM',
    rider: {
      name: 'Vikram Singh',
      phone: '+91 98765 12345',
      vehicle: 'Honda Activa (MH 02 XY 9988)'
    }
  },
  {
    id: 'FE-8610',
    date: '2026-10-22',
    status: 'Delivered',
    statusStep: 5,
    statusColor: 'success',
    items: [
      { name: 'Farmhouse Veggie Supreme', qty: 1, price: 379 }
    ],
    itemCount: 1,
    subtotal: 379,
    deliveryFee: 40,
    tax: 19,
    discount: 0,
    total: 438,
    deliveryAddress: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
    paymentMethod: 'Credit Card',
    estimatedDelivery: 'Delivered at 1:15 PM',
    rider: {
      name: 'Amit Patel',
      phone: '+91 98765 98765',
      vehicle: 'TVS Jupiter (MH 03 PQ 1122)'
    }
  }
];

const mockUser = {
  id: 1,
  name: 'Akant Sharma',
  email: 'akant@foodexpress.com',
  phone: '+91 98765 43210',
  address: 'Flat 402, Sunshine Residency, High Street, Mumbai - 400001',
  role: 'customer',
  memberSince: 'October 2026'
};

const adminStats = {
  totalRevenue: 284500,
  totalOrders: 1420,
  activeMenuItems: 24,
  totalCustomers: 856,
  recentOrders: [
    { id: 'FE-8921', customer: 'Akant Sharma', items: 'Smash Burger (x2), Margherita (x1)', total: 774, status: 'Out for Delivery', date: 'Just now' },
    { id: 'FE-8920', customer: 'Priya Nair', items: 'Paneer Biryani (x1), Lava Cake (x2)', total: 627, status: 'Preparing', date: '10 mins ago' },
    { id: 'FE-8919', customer: 'Rahul Deshmukh', items: 'BBQ Bacon Burger (x1)', total: 289, status: 'Confirmed', date: '25 mins ago' },
    { id: 'FE-8918', customer: 'Ananya Gupta', items: 'Greek Quinoa Salad (x2)', total: 538, status: 'Pending', date: '35 mins ago' },
    { id: 'FE-8917', customer: 'Kunal Kapoor', items: 'Pepperoni Feast Pizza (x1)', total: 489, status: 'Delivered', date: '1 hr ago' }
  ]
};

module.exports = {
  categories,
  foods,
  mockCart,
  mockOrders,
  mockUser,
  adminStats
};
