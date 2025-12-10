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
            return res.render('admin/login', { error: 'Invalid credentials' });
        }

        bcrypt.compare(password, user.password_hash, (err, result) => {
            if (result) {
                req.session.user = { id: user.id, username: user.username };
                return res.redirect('/admin/dashboard');
            } else {
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
