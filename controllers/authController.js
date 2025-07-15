const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/generateToken');
const { Op } = require('sequelize');


exports.signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const userExists = await User.findOne({ where: { email } });
  if (userExists) return res.status(400).json({ message: 'Email already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user);
  res.status(201).json({ token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = generateToken(user);
  res.status(200).json({ token });
};

exports.getUser = async (req, res) => {
  res.json(req.user);
};
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'No user with that email' });

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');

  // Set expiry 5 min from now
  const expiry = Date.now() + 5 * 60 * 1000;

  user.resetPasswordToken = token;
  user.resetPasswordExpires = expiry;
  await user.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`;

  // For dev — log the link
  console.log(`🔗 Reset Password Link: ${resetUrl}`);

  // Send email using Ethereal or your SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'YOUR_ETHEREAL_USER',
      pass: 'YOUR_ETHEREAL_PASS',
    },
  });

  const message = {
    from: '"Your App" <no-reply@yourapp.com>',
    to: user.email,
    subject: 'Password Reset',
    text: `Reset your password here: ${resetUrl}`,
  };

  await transporter.sendMail(message);

  res.json({ message: 'Reset password link sent to email!' });
};
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  res.json({ message: 'Password updated successfully!' });
};
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



