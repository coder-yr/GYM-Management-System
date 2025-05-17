const bcrypt = require('bcrypt');
const User = require('../models/User');

// Show login page
const showLogin = (req, res) => {
  res.render('auth/login', { message: null });
};

// Handle login logic
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Login POST body:', req.body);

    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', { message: 'Invalid email or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('auth/login', { message: 'Invalid email or password' });
    }

    // Save session and redirect based on role
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.save(() =>
      res.redirect(user.isAdmin ? '/admin/dashboard' : '/member/dashboard')
    );
  } catch (err) {
    console.error(err);
    res.render('auth/login', { message: 'Something went wrong' });
  }
};

// Show signup page
const showSignup = (req, res) => {
  res.render('auth/signup', { message: null });
};
// Handle signup logic
const signup = async (req, res) => {
  const { username, email, password, isAdmin } = req.body;
  try {
    if (await User.findOne({ email })) {
      return res.render('auth/signup', { message: 'Email already exists' });
    }

    const user = await new User({
      username,
      email,
      password, 
      isAdmin: isAdmin === 'true',
      isActive: isAdmin === 'true'
    }).save();

    // Log them in and redirect
    req.session.userId = user._id;
    req.session.isAdmin = user.isAdmin;
    req.session.save(() => res.redirect('/member/dashboard'));
  } catch (err) {
    console.error(err);
    res.render('auth/signup', { message: 'Signup failed' });
  }
};


// Logout
const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  showLogin,
  login,
  showSignup,
  signup,
  logout,
};
