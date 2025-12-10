require('dotenv').config();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        console.log('Initializing database...');
        db.serialize(() => {
            // 1. Create Tables
            db.exec(schema, (err) => {
                if (err) {
                    console.error('Error executing schema:', err.message);
                    return reject(err);
                }
                console.log('Tables created or already exist.');

                // 2. Seed Admin User
                const adminUsername = 'admin';
                const adminPassword = 'admin123';
                const saltRounds = 10;

                db.get("SELECT id FROM users WHERE username = ?", [adminUsername], (err, row) => {
                    if (err) console.error(err.message);
                    else if (!row) {
                        bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
                            if (!err) {
                                db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [adminUsername, hash]);
                                console.log('Admin user created (admin/admin123).');
                            }
                        });
                    }
                });

                // 3. Seed Demo Content (One Post)
                db.get("SELECT id FROM posts LIMIT 1", (err, row) => {
                    if (!row) {
                        const title = "Welcome to My Blog";
                        const content = "<p>This is a demo post.</p>";
                        const excerpt = "A simple demo post.";
                        const slug = slugify(title, { lower: true });
                        const status = 'published';
                        db.run(`INSERT INTO posts (title, slug, content, excerpt, status) VALUES (?, ?, ?, ?, ?)`,
                            [title, slug, content, excerpt, status], () => console.log('Demo post created.'));
                    }
                });

                // 4. Cleanup Old Comments - Final Step
                db.run("DELETE FROM comments WHERE created_at <= date('now', '-7 days')", (err) => {
                    if (err) console.error('Error cleaning up comments:', err);
                    console.log('Database initialization finished.');
                    resolve(); // Resolve promise instead of exit
                });
            });
        });
    });
};

// Auto-run if called directly from command line (check require.main)
if (require.main === module) {
    initializeDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = initializeDatabase;
