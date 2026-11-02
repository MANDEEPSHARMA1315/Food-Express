const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ==============================================================
  🚀 FoodExpress Web Application Running!
  --------------------------------------------------------------
  🌐 Local URL:       http://localhost:${PORT}
  🛠️  Admin Portal:    http://localhost:${PORT}/admin
  🍔 Menu Catalog:    http://localhost:${PORT}/menu
  🛒 Cart Page:       http://localhost:${PORT}/cart
  📦 Order Tracking:  http://localhost:${PORT}/orders/track
  👤 User Profile:    http://localhost:${PORT}/profile
  ⚙️  Environment:     ${config.nodeEnv}
  ==============================================================
  `);
});
