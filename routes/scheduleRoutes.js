const express = require('express');
const { getClassSchedules, bookClass, cancelBooking } = require('../controllers/scheduleController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', auth, getClassSchedules);
router.post('/book', auth, bookClass);
router.post('/cancel', auth, cancelBooking);

module.exports = router;
