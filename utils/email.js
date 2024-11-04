const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  auth: {
    user: config.emailUser,
    pass: config.emailPass,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.emailUser,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
