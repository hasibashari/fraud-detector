const express = require('express');
const router = express.Router();
const path = require('path');

const basePath = path.join(__dirname, '../../frontend/pages');

// Route to serve the home page
router.get('/', (req, res) => {
    res.sendFile(path.join(basePath, 'index.html'));
});

module.exports = router;