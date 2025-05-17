const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  feePackage: String,
  joinedDate: Date,
});

module.exports = mongoose.model('Member', memberSchema);
