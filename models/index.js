const db = require('../config/db');

// --- POSTS ---
exports.getPosts = (limit = 10, offset = 0) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM posts WHERE status = 'published' ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.getAllPostsAdmin = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM posts ORDER BY created_at DESC", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.getPostBySlug = (slug) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM posts WHERE slug = ?", [slug], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

exports.createPost = (data) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, excerpt, status, image_base64, video_url } = data;
        db.run(`INSERT INTO posts (title, slug, content, excerpt, status, image_base64, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title, slug, content, excerpt, status, image_base64, video_url], (err) => {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
};

exports.updatePost = (id, data) => {
    return new Promise((resolve, reject) => {
        const { title, slug, content, excerpt, status, image_base64, video_url } = data;
        // Updating image only if provided
        let sql = `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, status=?, video_url=? WHERE id=?`;
        let params = [title, slug, content, excerpt, status, video_url, id];

        if (image_base64) {
            sql = `UPDATE posts SET title=?, slug=?, content=?, excerpt=?, status=?, video_url=?, image_base64=? WHERE id=?`;
            params = [title, slug, content, excerpt, status, video_url, image_base64, id];
        }

        db.run(sql, params, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

exports.deletePost = (id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM posts WHERE id = ?", [id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// --- SLIDER ---
exports.getSliderItems = (activeOnly = true) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM slider_items ORDER BY display_order ASC";
        if (activeOnly) {
            sql = "SELECT * FROM slider_items WHERE active = 1 ORDER BY display_order ASC";
        }
        db.all(sql, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// --- COMMENTS ---
exports.getComments = (postId) => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM comments WHERE post_id = ? ORDER BY created_at DESC", [postId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

exports.addComment = (postId, author, content) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)", [postId, author, content], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// --- ABOUT ---
exports.getAbout = () => {
    return new Promise((resolve, reject) => {
        db.get("SELECT content FROM about_content LIMIT 1", (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.content : '');
        });
    });
};

exports.updateAbout = (content) => {
    return new Promise((resolve, reject) => {
        // Upsert logic (simplified)
        db.get("SELECT id FROM about_content LIMIT 1", (err, row) => {
            if (row) {
                db.run("UPDATE about_content SET content = ? WHERE id = ?", [content, row.id], (err) => {
                    if (err) reject(err); else resolve();
                });
            } else {
                db.run("INSERT INTO about_content (content) VALUES (?)", [content], (err) => {
                    if (err) reject(err); else resolve();
                });
            }
        });
    });
};

// --- SETTINGS ---
exports.getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM settings", [], (err, rows) => {
            if (err) reject(err);
            else {
                const settings = {};
                if (rows) {
                    rows.forEach(r => settings[r.key] = r.value);
                }
                resolve(settings);
            }
        });
    });
};

exports.updateSettings = (settings) => {
    return new Promise((resolve, reject) => {
        // Convert object to array of promises for individual updates
        // Since sqlite3 is async, we wrap this in Promise.all or handle serially
        // For simplicity with this library, let's just loop and hope for best (or better: serialize)

        db.serialize(() => {
            const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
            Object.keys(settings).forEach(key => {
                stmt.run(key, settings[key]);
            });
            stmt.finalize((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};
