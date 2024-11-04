const express = require('express');
const { getPackages, buyPackage } = require('../controllers/packageController');
const auth = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', auth, getPackages);
router.post('/buy', auth, buyPackage);

module.exports = router;
