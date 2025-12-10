const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const models = require('../models');
const slugify = require('slugify'); // Need to require this if not global
const db = require('../config/db'); // Direct DB access for some simpler queries if needed

router.use(isAuthenticated);

router.get('/dashboard', async (req, res) => {
    try {
        const posts = await models.getAllPostsAdmin();
        res.render('admin/dashboard', { posts, title: 'Dashboard' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// --- POSTS ---
router.get('/posts/new', (req, res) => {
    res.render('admin/posts/edit', { post: null, title: 'New Post' });
});

router.post('/posts/new', async (req, res) => {
    try {
        const { title, content, excerpt, status, video_url, image_base64 } = req.body;
        const slug = slugify(title, { lower: true, strict: true });

        await models.createPost({
            title, slug, content, excerpt, status, video_url, image_base64
        });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.render('admin/posts/edit', { post: req.body, title: 'New Post', error: err.message });
    }
});

router.get('/posts/edit/:id', async (req, res) => {
    db.get("SELECT * FROM posts WHERE id = ?", [req.params.id], (err, row) => {
        if (err || !row) return res.redirect('/admin/dashboard');
        res.render('admin/posts/edit', { post: row, title: 'Edit Post' });
    });
});

router.post('/posts/edit/:id', async (req, res) => {
    try {
        const { title, content, excerpt, status, video_url, image_base64 } = req.body;
        const slug = slugify(title, { lower: true, strict: true });

        await models.updatePost(req.params.id, {
            title, slug, content, excerpt, status, video_url, image_base64
        });
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
});

// --- SETTINGS ---
router.get('/settings', async (req, res) => {
    const settings = await models.getSettings();
    res.render('admin/settings', { settings, title: 'Site Settings' });
});

router.post('/settings', async (req, res) => {
    try {
        await models.updateSettings(req.body);
        res.redirect('/admin/settings');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/settings');
    }
});

router.get('/posts/delete/:id', async (req, res) => {
    await models.deletePost(req.params.id);
    res.redirect('/admin/dashboard');
});

// --- ABOUT ---
router.get('/about', async (req, res) => {
    const content = await models.getAbout();
    res.render('admin/about', { content, title: 'Edit About' });
});

router.post('/about', async (req, res) => {
    await models.updateAbout(req.body.content);
    res.redirect('/admin/about');
});

module.exports = router;
