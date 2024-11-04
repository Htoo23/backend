const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  className: { type: String, required: true },
  country: { type: String, required: true },
  creditsRequired: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  availableSlots: { type: Number, required: true },
  bookedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  waitlistUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
