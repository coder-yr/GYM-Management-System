const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membershipPlan: { type: String, required: true }, 
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  receipt: { type: mongoose.Schema.Types.ObjectId, ref: 'Receipt' }
});

module.exports = mongoose.model('Payment', paymentSchema);
