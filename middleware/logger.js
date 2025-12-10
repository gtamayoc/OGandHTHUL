const db = require('../config/db');
const models = require('../models');

const logVisits = (req, res, next) => {
    if (req.originalUrl.startsWith('/css') || req.originalUrl.startsWith('/js') || req.originalUrl.startsWith('/images')) {
        return next();
    }

    const route = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;

    const query = "INSERT INTO visits (route, ip) VALUES (?, ?)";
    db.run(query, [route, ip], (err) => {
        if (err) console.error("Error logging visit:", err.message);
    });
    next();
};

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

const loadSettings = async (req, res, next) => {
    try {
        const settings = await models.getSettings();
        res.locals.settings = settings;
        next();
    } catch (err) {
        console.error("Error loading settings:", err);
        res.locals.settings = { site_title: 'My Blog', footer_text: '© 2025' }; // Fallback
        next();
    }
};

module.exports = { logVisits, isAuthenticated, loadSettings };
