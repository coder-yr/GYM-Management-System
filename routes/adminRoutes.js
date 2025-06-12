const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontroller');
const { ensureAdmin } = require('../middleware/authMiddleware');

// Admin Dashboard
router.get('/dashboard', ensureAdmin, adminController.getAdminDashboard);

// View User Profile
router.get('/user/:userId', ensureAdmin, adminController.viewUserProfile);

// Assign Diet Plan
router.get('/assign-diet/:userId', ensureAdmin, adminController.renderAssignDietForm);
router.post('/assign-diet/:userId', ensureAdmin, adminController.assignDietPlan);

// Send Notification
router.get('/notify/:userId', ensureAdmin, adminController.getNotifyForm);
router.post('/notify/:userId', ensureAdmin, adminController.sendNotification);

// Deactivate / Reactivate Users
router.post('/deactivate/:userId', ensureAdmin, adminController.deactivateUser);
router.post('/reactivate/:userId', ensureAdmin, adminController.reactivateUser);

module.exports = router;
