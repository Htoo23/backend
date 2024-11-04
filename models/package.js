const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  country: { type: String, required: true },
  credits: { type: Number, required: true },
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
