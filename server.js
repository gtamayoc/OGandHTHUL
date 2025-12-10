require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const morgan = require('morgan');

// Import Middleware
const { logVisits, loadSettings } = require('./middleware/logger');

// Import Routes
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(loadSettings); // Apply global settings middleware

// Session Configuration
app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: 'database' }),
    secret: process.env.SESSION_SECRET || 'secret_key_dev',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 1 week
}));

// Global Variables for Views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Custom Logging
app.use(logVisits);

// Routes
// Routes - define specific routes first!
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', publicRoutes);

// Error Handling
app.use((req, res) => {
    res.status(404).render('public/404', { title: 'Page Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
