/**
 * Authentication and Role-Based Authorization Middleware
 */

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  return res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).render('pages/404', {
    title: '403 - Access Denied',
    message: 'Access Denied: You must be signed in as an Administrator to access this portal.'
  });
};

module.exports = {
  isAuthenticated,
  isAdmin
};
