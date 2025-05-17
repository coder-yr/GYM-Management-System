const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  dietPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DietPlan'
  },
  receipts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt'
  }],


  membershipPlan: { type: String },
  membershipPrice: { type: Number },
  membershipActive: { type: Boolean, default: false },
  membershipStartDate: { type: Date },

}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
