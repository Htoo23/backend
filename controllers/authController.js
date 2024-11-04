const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const sendEmail = require('../utils/email');

exports.register = async (req, res) => {
  const { name, email, password, country } = req.body;
  try {
    const user = new User({ name, email, password, country });
    await user.save();

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
    const url = `${config.clientURL}/verify/${token}`;
    await sendEmail(user.email, 'Verify Email', `Click here to verify: ${url}`);

    res.status(201).json({ message: 'User registered, please verify your email.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, config.jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

