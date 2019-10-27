const express = require('express');
const router = express.Router();

// @route     GET api/posts
// @desc      Test route for posts
// @access    Public
router.get('/', (req, res) => res.send('posts route is running'));

module.exports = router;
