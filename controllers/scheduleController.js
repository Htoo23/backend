const Schedule = require('../models/schedule');
const { getAsync, setAsync, delAsync } = require('../utils/redisClient');

exports.getClassSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ country: req.user.country });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookClass = async (req, res) => {
  const { scheduleId } = req.body;
  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Class not found' });
    }
    if (schedule.country !== req.user.country) {
      return res.status(403).json({ error: 'Class not available in your country' });
    }
    if (req.user.packages.length === 0) {
      return res.status(400).json({ error: 'No package available' });
    }

    const userPackage = req.user.packages.find(p => p.credits >= schedule.creditsRequired && new Date(p.expiryDate) > new Date());
    if (!userPackage) {
      return res.status(400).json({ error: 'Insufficient credits or package expired' });
    }

    const cachedSlot = await getAsync(`schedule_${scheduleId}`);
    if (cachedSlot && cachedSlot <= 0) {
      if (schedule.waitlistUsers.includes(req.user._id)) {
        return res.status(400).json({ error: 'Already in the waitlist' });
      }
      schedule.waitlistUsers.push(req.user._id);
      await schedule.save();
      return res.json({ message: 'Class is full. Added to waitlist.' });
    }

    schedule.bookedUsers.push(req.user._id);
    await schedule.save();

    userPackage.credits -= schedule.creditsRequired;
    await userPackage.save();

    await setAsync(`schedule_${scheduleId}`, cachedSlot - 1);

    res.json({ message: 'Class booked successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  const { scheduleId } = req.body;
  try {
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const index = schedule.bookedUsers.indexOf(req.user._id);
    if (index === -1) {
      return res.status(400).json({ error: 'Booking not found' });
    }

    const now = new Date();
    const startTime = new Date(schedule.startTime);
    if (startTime - now >= 4 * 60 * 60 * 1000) {
      const userPackage = req.user.packages.find(p => p.credits >= schedule.creditsRequired && new Date(p.expiryDate) > new Date());
      if (userPackage) {
        userPackage.credits += schedule.creditsRequired;
        await userPackage.save();
      }
    }

    schedule.bookedUsers.splice(index, 1);
    if (schedule.waitlistUsers.length > 0) {
      const nextUser = schedule.waitlistUsers.shift();
      schedule.bookedUsers.push(nextUser);
      const nextUserPackage = await User.findById(nextUser).populate('packages').exec();
      const packageToUpdate = nextUserPackage.packages.find(p => p.credits >= schedule.creditsRequired && new Date(p.expiryDate) > new Date());
      if (packageToUpdate) {
        packageToUpdate.credits -= schedule.creditsRequired;
        await packageToUpdate.save();
      }
    }

    await schedule.save();

    const cachedSlot = await getAsync(`schedule_${scheduleId}`);
    await setAsync(`schedule_${scheduleId}`, cachedSlot + 1);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

