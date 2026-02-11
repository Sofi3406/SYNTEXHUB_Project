const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// REGISTER - Name + Email + Password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Name, email, and password are required' });
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    // Build a unique username (DB has a unique index on username)
    const emailLocal = normalizedEmail.split('@')[0];
    const baseUsername = (name || emailLocal)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9._-]/g, '')
      .slice(0, 20) || emailLocal;

    let username = baseUsername;
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      username = `${baseUsername}${suffix}`;
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      username,
      password: hashedPassword
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// LOGIN - Email + Password ONLY (FIXED)
router.post('/login', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    const loginEmail = (email || username || '').trim().toLowerCase();
    if (!loginEmail || !password) {
      return res.status(400).json({ msg: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: loginEmail });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

module.exports = router;
