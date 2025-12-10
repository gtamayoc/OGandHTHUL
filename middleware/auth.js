// Re-exporting from logger just to keep structure but technically defined there for now or can move.
// To keep it clean, let's just require it from logger or move the specific auth logic here.
// For now, I'll refer to logger.js which has both.
const { isAuthenticated } = require('./logger');
module.exports = { isAuthenticated };
