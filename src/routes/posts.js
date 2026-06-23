const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const postsController = require('../controllers/postsController');

router.post('/text', requireAuth, postsController.publishText);
router.get('/mine', requireAuth, postsController.getMine);
router.post('/comment', requireAuth, postsController.publishComment);

module.exports = router;
