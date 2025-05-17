const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },   
  price: { type: Number, required: true },
  description: { type: String }
});

module.exports = mongoose.model('Membership', membershipSchema);
