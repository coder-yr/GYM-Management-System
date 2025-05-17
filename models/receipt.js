const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  membershipPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true }, 
  amount: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  receiptUrl: { type: String } 
});

module.exports = mongoose.model('Receipt', receiptSchema);
