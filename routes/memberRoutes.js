const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Member Dashboard
router.get('/dashboard', memberController.memberDashboard);

// Membership selection page
router.get('/membership/select', memberController.showSelectMembership);
router.post('/membership/select', memberController.selectMembership);

module.exports = router;
