require('dotenv').config();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const slugify = require('slugify');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Initializing database...');

db.serialize(() => {
    // 1. Create Tables
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema:', err.message);
            return;
        }
        console.log('Tables created or already exist.');

        // 2. Seed Admin User
        const adminUsername = 'admin';
        const adminPassword = 'admin123'; // Default password, change in production
        const saltRounds = 10;

        db.get("SELECT id FROM users WHERE username = ?", [adminUsername], (err, row) => {
            if (err) {
                console.error(err.message);
            } else if (!row) {
                bcrypt.hash(adminPassword, saltRounds, (err, hash) => {
                    if (err) console.error(err);
                    db.run("INSERT INTO users (username, password_hash) VALUES (?, ?)", [adminUsername, hash], (err) => {
                        if (err) console.error(err.message);
                        else console.log('Admin user created (admin/admin123).');
                    });
                });
            } else {
                console.log('Admin user already exists.');
            }
        });

        // 3. Seed Demo Content (One Post)
        db.get("SELECT id FROM posts LIMIT 1", (err, row) => {
            if (err) console.error(err);
            else if (!row) {
                const title = "Welcome to My Blog";
                const content = "<p>This is a demo post to help you practice English. Pay attention to the pronouns and connectors used in this text.</p><p><b>He</b> went to the store, <b>but</b> <b>he</b> forgot his wallet. <b>However</b>, <b>she</b> was there to help <b>him</b>.</p>";
                const excerpt = "A simple post to practice English pronouns and connectors.";
                const slug = slugify(title, { lower: true });
                const status = 'published';

                db.run(`INSERT INTO posts (title, slug, content, excerpt, status) VALUES (?, ?, ?, ?, ?)`,
                    [title, slug, content, excerpt, status],
                    (err) => {
                        if (err) console.error(err.message);
                        else console.log('Demo post created.');
                    });
            }
        });

        // 4. Cleanup Old Comments (Older than 7 days)
        db.run("DELETE FROM comments WHERE created_at <= date('now', '-7 days')", (err) => {
            if (err) console.error('Error cleaning up comments:', err);
            else console.log('Old comments cleanup check complete.');
        });
    });
});
