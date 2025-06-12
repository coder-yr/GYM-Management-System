const User = require('../models/User');
const DietPlan = require('../models/DietPlan');
const Receipt = require('../models/receipt');
const Notification = require('../models/Notification');
const Membership = require('../models/Membership');

// Render admin dashboard
exports.getAdminDashboard = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .populate('dietPlan')
      .populate('receipts');

    res.render('adminDashboard', {
      users,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading dashboard');
    res.redirect('/');
  }
};

// View single user's profile
exports.viewUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('dietPlan');

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    //  Fetch receipts by userId (not from user.receipts)
    const receipts = await Receipt.find({ userId: user._id })
      .populate('membershipPlan')
      .sort({ purchaseDate: -1 });

    console.log('User:', user);
    console.log('Receipts:', receipts);

    res.render('userProfile', {
      user,
      receipts,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading user profile');
    res.redirect('/admin/dashboard');
  }
};

// Render Assign Diet Plan form
exports.renderAssignDietForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    res.render('dietplans/index.ejs', {
      user,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading diet plan form');
    res.redirect('/admin/dashboard');
  }
};

// Handle Diet Plan assignment
exports.assignDietPlan = async (req, res) => {
  const { name, description, meals } = req.body;

  try {
    let mealsArray = [];
    if (Array.isArray(meals)) {
      mealsArray = meals.map(m => m.trim()).filter(m => m.length > 0);
    } else if (typeof meals === 'string') {
      mealsArray = meals.split(',').map(m => m.trim()).filter(m => m.length > 0);
    }

    // Remove existing diet plan
    await DietPlan.findOneAndDelete({ user: req.params.userId });

    const dietPlan = new DietPlan({
      name,
      description,
      meals: mealsArray,
      user: req.params.userId
    });
    await dietPlan.save();

    const user = await User.findById(req.params.userId);
    user.dietPlan = dietPlan._id;
    await user.save();

    req.flash('success', 'Diet Plan assigned successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error assigning diet plan');
    res.redirect('/admin/dashboard');
  }
};

// Render notification form
exports.getNotifyForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    res.render('notifyForm', {
      user,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load notification form');
    res.redirect('/admin/dashboard');
  }
};

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { message } = req.body;

    if (!message || message.trim() === '') {
      req.flash('error', 'Message cannot be empty');
      return res.redirect(`/admin/notify-user/${userId}`);
    }

    const notification = new Notification({
      memberId: userId, 
      message,
      date: new Date()
    });
    await notification.save();

    req.flash('success', 'Notification sent successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error sending notification:', err);
    req.flash('error', 'Failed to send notification');
    res.redirect('/admin/dashboard');
  }
};

// Member dashboard (diet plan & notifications)
exports.memberDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('dietPlan');
    if (!user) {
      req.flash('error', 'User not found. Please log in again.');
      return res.redirect('/auth/login');
    }

    const membership = await Membership.findOne({ user: user._id }).populate('plan');

    const receipts = await Receipt.find({ userId: user._id })
      .sort({ purchaseDate: -1 })
      .populate('membershipPlan');

    const notifications = await Notification.find({ memberId: user._id }).sort({ date: -1 });

    res.render('member/memberDashboard', {
      user,
      membership,
      receipts,
      dietPlan: user.dietPlan,
      notifications,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error('Error in memberDashboard:', err);
    req.flash('error', 'Error loading member dashboard');
    res.redirect('/auth/login');
  }
};

// Deactivate a user
exports.deactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: false });
    req.flash('success', 'User deactivated successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error deactivating user:', err);
    req.flash('error', 'Error deactivating user');
    res.redirect('/admin/dashboard');
  }
};

// Reactivate a user
exports.reactivateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { isActive: true });
    req.flash('success', 'User reactivated successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error reactivating user');
    res.redirect('/admin/dashboard');
  }
};
