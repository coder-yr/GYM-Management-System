const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },   
  price: { type: Number, required: true },
  description: { type: String }
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
