const db = require('../config/db');

const sql = `
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
`;

db.serialize(() => {
    db.run(sql, (err) => {
        if (err) {
            console.error('Error creating settings table:', err);
        } else {
            console.log('Settings table created.');

            // Seed defaults
            const defaults = [
                { key: 'site_title', value: 'My Blog' },
                { key: 'footer_text', value: '© 2025 Blog Project. All rights reserved.' }
            ];

            const stmt = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
            defaults.forEach(d => {
                stmt.run(d.key, d.value);
            });
            stmt.finalize(() => {
                console.log('Default settings seeded.');
            });
        }
    });
});
