const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

router.get('/login', (req, res) => {
    res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            console.log(`Login failed: User '${username}' not found.`);
            return res.render('admin/login', { error: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (result) {
                console.log(`Login success: User '${username}' logged in.`);
                req.session.user = { id: user.id, username: user.username };
                return res.redirect('/admin/dashboard');
            } else {
                console.log(`Login failed: Invalid password for user '${username}'.`);
                // Check hash length to verify seeding wasn't truncated
                console.log('Hash length verified:', user.password_hash.length);
                return res.render('admin/login', { error: 'Invalid credentials' });
            }
        });
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
