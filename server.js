const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- IN-MEMORY DATABASE (Resets on restart) ---
// In a real production app, use MongoDB, PostgreSQL, or SQLite.
let users = [];
let validLicenseKeys = ['HEALTHY-PRO-2024', 'ADMIN-TEST']; // Pre-generated keys

// --- HELPER FUNCTIONS ---
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PRO-';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  result += '-';
  for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

// --- ROUTES ---

// 1. Register User
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    email,
    password, // Note: Hash passwords in real apps!
    profile: {
      name,
      email,
      age: 25,
      gender: 'Male',
      height: 175,
      weight: 70,
      goal: 'Lose Weight',
      activityLevel: 'Moderate',
      dietaryPreference: 'None',
      allergies: '',
      isPremium: false,
      paymentStatus: 'none',
      lastTransactionId: ''
    }
  };

  users.push(newUser);
  console.log(`[NEW USER] ${email} registered.`);
  res.json({ user: newUser.profile });
});

// 2. Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // HARDCODED ADMIN CHECK
  if (email === 'admin@admin.com' && password === 'admin123') {
    return res.json({ 
      user: { 
        name: 'Admin', 
        email: 'admin@admin.com', 
        isAdmin: true // Special flag
      } 
    });
  }

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ user: user.profile });
});

// 3. Submit Payment (User sends Trans ID)
app.post('/api/payment/submit', (req, res) => {
  const { email, transactionId } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Update User Status
  user.profile.paymentStatus = 'pending';
  user.profile.lastTransactionId = transactionId;

  // --- ADMIN CONSOLE LOGIC ---
  const newKey = generateLicenseKey();
  validLicenseKeys.push(newKey);

  console.log('\n==================================================');
  console.log('💰 NEW PAYMENT RECEIVED');
  console.log(`👤 User: ${email}`);
  console.log(`🧾 Transaction ID: ${transactionId}`);
  console.log('--------------------------------------------------');
  
  res.json({ success: true, user: user.profile });
});

// 4. Redeem License Key
app.post('/api/payment/redeem', (req, res) => {
  const { email, code } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check Code
  const keyIndex = validLicenseKeys.indexOf(code);
  if (keyIndex > -1) {
    user.profile.isPremium = true;
    user.profile.paymentStatus = 'approved';
    console.log(`[PREMIUM ACTIVATED] ${email} used code ${code}`);
    res.json({ success: true, user: user.profile });
  } else {
    res.status(400).json({ error: 'Invalid or expired license key' });
  }
});

// 5. Sync User Profile (Save settings/stats)
app.post('/api/user/sync', (req, res) => {
  const { email, profile } = req.body;
  const userIndex = users.findIndex(u => u.email === email);

  if (userIndex > -1) {
    users[userIndex].profile = { ...users[userIndex].profile, ...profile };
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// --- ADMIN ROUTES ---

// Get all users
app.get('/api/admin/users', (req, res) => {
  // In a real app, verify admin token here
  const safeUsers = users.map(u => ({
    email: u.email,
    name: u.profile.name,
    paymentStatus: u.profile.paymentStatus,
    lastTransactionId: u.profile.lastTransactionId,
    isPremium: u.profile.isPremium
  }));
  res.json(safeUsers);
});

// Approve a user manually
app.post('/api/admin/approve', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user) {
    user.profile.isPremium = true;
    user.profile.paymentStatus = 'approved';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 heAIthy Backend running at http://localhost:${PORT}`);
  console.log(`🔑 Admin Login: admin@admin.com / admin123`);
});