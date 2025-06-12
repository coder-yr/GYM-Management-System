const User = require('../models/User');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const Receipt = require('../models/receipt');
const Notification = require('../models/Notification');
const { generateReceiptPDF } = require('../utils/pdfGenerator');

// Show Member Dashboard
exports.memberDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('dietPlan');
    if (!user) {
      req.flash('error', 'User not found, please login again');
      return res.redirect('/auth/login');
    }

    const membership = await Membership.findOne({ user: user._id }).populate('plan');

    const receipts = await Receipt.find({ userId: user._id })
      .sort({ purchaseDate: -1 })
      .populate('membershipPlan');

    const notifications = await Notification.find({ userId: user._id })
      .sort({ date: -1 });

    res.render('member/memberDashboard', {
      user,
      membership,
      receipts,
      dietPlan: user.dietPlan,
      notifications,
      messages: {
        success: req.flash('success'),
        error: req.flash('error'),
      }
    });
  } catch (err) {
    console.error('Error in memberDashboard:', err);
    req.flash('error', 'Error loading member dashboard');
    res.redirect('/auth/login');
  }
};
// Show Membership Selection Page
exports.showSelectMembership = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({});
    res.render('member/select', {
      plans,
      messages: {
        success: req.flash('success'),
        error: req.flash('error'),
      }
    });
  } catch (err) {
    console.error('Error loading membership selection:', err);
    req.flash('error', 'Failed to load membership plans');
    res.redirect('/member/dashboard');
  }
};

// Handle Membership Selection POST
exports.selectMembership = async (req, res) => {
  const { planId } = req.body;
  const userId = req.session.userId;

  if (!planId) {
    req.flash('error', 'Please select a membership plan.');
    return res.redirect('/membership/select');
  }

  try {
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      req.flash('error', 'Selected membership plan does not exist.');
      return res.redirect('/membership/select');
    }

    let membership = await Membership.findOne({ user: userId });
    if (membership) {
      membership.plan = plan._id;
      membership.price = plan.price;
      membership.description = plan.description;
      membership.startDate = new Date();
      await membership.save();
    } else {
      membership = new Membership({
        user: userId,
        plan: plan._id,
        price: plan.price,
        description: plan.description,
        startDate: new Date(),
      });
      await membership.save();
    }

    const payment = new Payment({
      user: userId,
      membershipPlan: plan._id,
      amount: plan.price,
      date: new Date()
    });
    await payment.save();

    const receipt = new Receipt({
      userId: userId,
      membershipPlan: plan._id,
      amount: plan.price,
      purchaseDate: payment.date
    });
    await receipt.save();

    await receipt.populate('membershipPlan');

    const user = await User.findById(userId);
    const fileName = `receipt_${receipt._id}.pdf`;

    await generateReceiptPDF(receipt, user, fileName);

    receipt.receiptUrl = `/receipts/${fileName}`;
    await receipt.save();

    payment.receipt = receipt._id;
    await payment.save();

    req.flash('success', `Membership plan "${plan.name}" selected and receipt generated successfully.`);
    res.redirect('/member/dashboard');
  } catch (err) {
    console.error('Error selecting membership:', err);
    req.flash('error', 'Failed to select membership plan or generate receipt.');
    res.redirect('/membership/select');
  }
};
