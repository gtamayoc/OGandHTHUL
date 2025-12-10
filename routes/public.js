const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/', async (req, res) => {
    try {
        const sliderItems = await models.getSliderItems(true);
        const posts = await models.getPosts();
        res.render('public/index', { sliderItems, posts, title: 'Home' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/about', async (req, res) => {
    try {
        const content = await models.getAbout();
        res.render('public/about', { content, title: 'About Us' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/post/:slug', async (req, res) => {
    try {
        const post = await models.getPostBySlug(req.params.slug);
        if (!post) return res.status(404).send('Post not found');

        const comments = await models.getComments(post.id);
        res.render('public/post', { post, comments, title: post.title });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/post/:slug/comment', async (req, res) => {
    try {
        const post = await models.getPostBySlug(req.params.slug);
        if (!post) return res.status(404).send('Post not found');

        const { author, content } = req.body;
        // Basic spam protection could go here
        await models.addComment(post.id, author || 'Anonymous', content);
        res.redirect(`/post/${req.params.slug}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
