const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const dbPath = path.join(__dirname, 'data', 'submissions.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    description TEXT,
    timestamp TEXT NOT NULL
  )
`);

// Hardcoded admin password (change this in production)
const ADMIN_PASSWORD = 'twinrivers2024';

// API Routes

// POST /api/submit-quote - Submit contact form
app.post('/api/submit-quote', (req, res) => {
  try {
    const { name, phone, email, description } = req.body;
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO submissions (name, phone, email, description, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(name, phone || '', email || '', description || '', timestamp);

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ success: false, error: 'Failed to save submission' });
  }
});

// POST /api/login - Admin login
app.post('/api/login', (req, res) => {
  try {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
      // Generate simple token (in production, use JWT)
      const token = Buffer.from(`twinrivers:${Date.now()}`).toString('base64');
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, error: 'Invalid password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// GET /api/submissions - Get all submissions (requires auth)
app.get('/api/submissions', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const stmt = db.prepare('SELECT * FROM submissions ORDER BY id DESC');
    const submissions = stmt.all();

    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Twin Rivers API server running on http://localhost:${PORT}`);
});
