const express = require('express');
const router = express.Router();
const dietController = require('../controllers/dietController');

// Middleware to check admin authentication (optional)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  req.flash('error', 'Unauthorized');
  res.redirect('/');
};

// Render page to assign diet plan to user
router.get('/assign-diet/:userId', isAdmin, dietController.renderAssignDietPlanPage);

// Handle form submission to assign or update diet plan for user
router.post('/assign-diet/:userId', isAdmin, dietController.assignDietPlan);

// Render edit diet plan page by dietPlanId
router.get('/edit-diet/:dietPlanId', isAdmin, dietController.renderEditDietPlanPage);

// Handle update diet plan form submission
router.post('/edit-diet/:dietPlanId', isAdmin, dietController.updateDietPlan);

// Delete diet plan by dietPlanId
router.post('/delete-diet/:dietPlanId', isAdmin, dietController.deleteDietPlan);

module.exports = router;
