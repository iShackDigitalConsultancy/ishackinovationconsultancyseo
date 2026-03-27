const db = require('./db');

try {
  // Try adding column, ignore if it already exists
  db.exec('ALTER TABLE agencies ADD COLUMN role TEXT DEFAULT "free"');
  console.log('Migration successful: Added role column');
} catch(e) {
  if (e.message.includes('duplicate column name')) {
    console.log('Migration skipped: role column already exists');
  } else {
    console.log('Migration error:', e.message);
  }
}
