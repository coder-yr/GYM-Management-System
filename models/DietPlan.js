// models/DietPlan.js
const mongoose = require('mongoose');

const dietPlanSchema = new mongoose.Schema({
  name: String,
  description: String,
  meals: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);
