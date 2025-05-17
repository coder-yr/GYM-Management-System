require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

const receiptsDir = path.join(__dirname, 'public', 'receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Model Imports
const User = require('./models/User');
const Membership = require('./models/Membership');
const Payment = require('./models/Payment');
const DietPlan = require('./models/DietPlan');
const Receipt = require('./models/Receipt');
const Notification = require('./models/Notification');  

// Middleware Setup

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(flash());
app.use(helmet());
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';"
  );
  next();
});


// Session Config
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  })
);

// Load user from session
app.use(async (req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');

  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      req.user = user || null;
      res.locals.currentUser = user || null;
    } catch (err) {
      console.error('User fetch failed:', err);
      req.user = null;
      res.locals.currentUser = null;
    }
  } else {
    req.user = null;
    res.locals.currentUser = null;
  }
  next();
});

// View Engine
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

// Middleware imports
const { isLoggedIn, ensureAdmin } = require('./middleware/authMiddleware');

// Route imports
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/memberRoutes');  
const notificationRoutes = require('./routes/notificationRoutes');
const dietPlanRoutes = require('./routes/dietRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const adminRoutes = require('./routes/adminRoutes');
const selectRoutes = require('./routes/select');

// Home Page
app.get('/', (req, res) => {
  res.render('home');
});

// Member Dashboard Route 
app.get('/member/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) {
      req.flash('error', 'Please login first.');
      return res.redirect('/auth/login');
    }

    const user = await User.findById(userId).populate('dietPlan');
    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/auth/login');
    }

    const membership = await Membership.findOne({ user: user._id }).populate('plan');

    // Fetch receipts array
    const receipts = await Receipt.find({ userId: user._id })
      .sort({ purchaseDate: -1 })
      .populate('membershipPlan');

    const notifications = await Notification.find({ userId: user._id }).sort({ date: -1 });

    res.render('member/memberDashboard', {
      user,
      membership,
      receipts, 
      dietPlan: user.dietPlan,
      notifications,
      messages: {
        success: req.flash('success'),
        error: req.flash('error'),
      },
    });
  } catch (err) {
    console.error('Detailed error loading member dashboard:', err);
    req.flash('error', 'Error loading member dashboard. Please try again later.');
    res.redirect('/auth/login');
  }
});


// Mount routes
app.use('/auth', authRoutes);
app.use('/member', memberRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin/diet-plans', dietPlanRoutes);
app.use('/membership', selectRoutes);
app.use('/receipts', receiptRoutes);
app.use('/admin', adminRoutes);

// 404 Page
app.use((req, res) => {
  res.status(404).render('404');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
