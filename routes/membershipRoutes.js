const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const { createReceipt } = require('../controllers/receiptController');

// GET membership plan selection page
router.get('/select', isLoggedIn, async (req, res) => {
  try {
    const plans = await MembershipPlan.find();
    res.render('member/select', {
      plans,
      messages: {
        success: req.flash('success'),
        error: req.flash('error')
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load membership plans');
    res.redirect('/member/dashboard');
  }
});

// POST select plan and generate receipt
router.post('/select', isLoggedIn, async (req, res) => {
  try {
    const planId = req.body.planId;
    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      req.flash('error', 'Selected plan does not exist');
      return res.redirect('/membership/select');
    }

    let membership = await Membership.findOne({ user: req.session.userId });
    if (!membership) {
      membership = new Membership({
        user: req.session.userId,
        plan: plan.name,
        price: plan.price,
        description: plan.description,
        startDate: new Date(),
      });
    } else {
      membership.plan = plan.name;
      membership.price = plan.price;
      membership.description = plan.description;
      membership.startDate = new Date();
    }

    await membership.save();

    // Generate receipt
    await createReceipt(req.session.userId, plan.name, plan.price);

    req.flash('success', `Membership plan "${plan.name}" selected successfully! Receipt created.`);
    res.redirect('/member/dashboard');
  } catch (err) {
    console.error('Error selecting membership plan:', err);
    req.flash('error', 'Error selecting membership plan');
    res.redirect('/membership/select');
  }
});

module.exports = router;
