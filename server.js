const express = require('express');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('node:sqlite');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const dbPath = path.join(__dirname, 'data', 'nitro.db');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

let db;
async function initDb() {
  try {
    db = new sqlite3.DatabaseSync(dbPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        distance INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
}
initDb();

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get high scores
app.get('/api/scores', (req, res) => {
  try {
    if (!db) return res.json([]);
    const stmt = db.prepare('SELECT player_name, score, distance, created_at FROM scores ORDER BY score DESC LIMIT 10');
    const scores = stmt.all();
    res.json(scores);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve scores' });
  }
});

// Post new score
app.post('/api/scores', (req, res) => {
  try {
    const { player_name, score, distance } = req.body;
    const name = (player_name || 'Anonymous').trim().substring(0, 30);
    const finalScore = parseInt(score, 10) || 0;
    const finalDistance = parseInt(distance, 10) || 0;

    if (!db) return res.status(500).json({ error: 'Database not ready' });

    const stmt = db.prepare('INSERT INTO scores (player_name, score, distance) VALUES (?, ?, ?)');
    stmt.run(name, finalScore, finalDistance);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Nitro Shootout running on port ${PORT}`);
});
