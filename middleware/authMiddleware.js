// middleware/authMiddleware.js
const User = require('../models/User');

module.exports = {
 
  loadUser: async (req, res, next) => {
    if (req.session.userId) {
      try {
        const user = await User.findById(req.session.userId);
        if (user) {
          req.user = user;
        }
      } catch (err) {
        console.error('Error loading user in middleware:', err);
      }
    }
    next();
  },

  // Check if user is logged in
  isLoggedIn: (req, res, next) => {
    if (req.session.userId) {
      return next();
    }
    req.flash('error', 'Please log in to continue.');
    res.redirect('/auth/login');
  },

  // Check if user is admin (using session directly)
  ensureAdmin: (req, res, next) => {
    if (req.session.isAdmin) {
      return next();
    }
    req.flash('error', 'Access denied. Admins only.');
    res.redirect('/');
  }
};
