const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

// Render page to assign a diet plan to a specific user
exports.renderAssignDietPlanPage = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate('dietPlan');
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    res.render('dietplans/index.ejs', { user });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading diet plans');
    res.redirect('/admin/dashboard');
  }
};

// Assign or update a diet plan for a user
exports.assignDietPlan = async (req, res) => {
  const { dietPlanName, dietPlanDescription } = req.body;
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/admin/dashboard');
    }

    if (!dietPlanName || !dietPlanDescription) {
      req.flash('error', 'Please provide both the diet plan name and description');
      return res.redirect(`/admin/assign-diet/${userId}`);
    }

    // Check if diet plan exists for this user
    let dietPlan = await DietPlan.findOne({ user: userId });

    if (dietPlan) {
      
      dietPlan.name = dietPlanName;
      dietPlan.description = dietPlanDescription;
      await dietPlan.save();
    } else {
      
      dietPlan = new DietPlan({
        name: dietPlanName,
        description: dietPlanDescription,
        user: userId
      });
      await dietPlan.save();
    }

    
    user.dietPlan = dietPlan._id;
    await user.save();

    req.flash('success', 'Diet plan assigned successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error assigning diet plan');
    res.redirect('/admin/dashboard');
  }
};

// Render edit diet plan page
exports.renderEditDietPlanPage = async (req, res) => {
  const dietPlanId = req.params.dietPlanId;

  try {
    const dietPlan = await DietPlan.findById(dietPlanId);
    if (!dietPlan) {
      req.flash('error', 'Diet Plan not found');
      return res.redirect('/admin/dashboard');
    }

    res.render('editDietPlan', { dietPlan });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error loading diet plan');
    res.redirect('/admin/dashboard');
  }
};

// Update a diet plan
exports.updateDietPlan = async (req, res) => {
  const { dietPlanName, dietPlanDescription } = req.body;
  const dietPlanId = req.params.dietPlanId;

  try {
    if (!dietPlanName || !dietPlanDescription) {
      req.flash('error', 'Please provide both the diet plan name and description');
      return res.redirect(`/admin/edit-diet/${dietPlanId}`);
    }

    await DietPlan.findByIdAndUpdate(
      dietPlanId,
      { name: dietPlanName, description: dietPlanDescription },
      { new: true }
    );

    req.flash('success', 'Diet plan updated successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error updating diet plan');
    res.redirect('/admin/dashboard');
  }
};

// Delete a diet plan
exports.deleteDietPlan = async (req, res) => {
  const dietPlanId = req.params.dietPlanId;

  try {
    const dietPlan = await DietPlan.findById(dietPlanId);
    if (!dietPlan) {
      req.flash('error', 'Diet Plan not found');
      return res.redirect('/admin/dashboard');
    }

   
    await User.updateMany({ dietPlan: dietPlanId }, { $unset: { dietPlan: "" } });

    await dietPlan.deleteOne();

    req.flash('success', 'Diet plan deleted successfully');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error deleting diet plan');
    res.redirect('/admin/dashboard');
  }
};
