const express = require('express');
const path = require('path');
const session = require('express-session');
const config = require('./config');
const { initDatabase } = require('./config/db');
const viewVariables = require('./middleware/viewVariables');
const routes = require('./routes');

const app = express();

// Initialize Database connection / seed
initDatabase();

// Set View Engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 Hours
    }
  })
);

// Serve Static Assets from /public directory
app.use(express.static(path.join(__dirname, '../public')));

// Global Template Variables Middleware
app.use(viewVariables);

// Mount Application Routes
app.use('/', routes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).render('pages/404', {
    title: '500 - Server Error – FoodExpress',
    message: 'An unexpected internal error occurred. Please try again later.'
  });
});

module.exports = app;
