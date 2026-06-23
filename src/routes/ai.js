const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const aiController = require('../controllers/aiController');

router.post('/generate-post', requireAuth, aiController.generatePost);
router.post('/improve-post', requireAuth, aiController.improvePost);
router.post('/suggest-comment', requireAuth, aiController.suggestComment);
router.post('/evaluate-share', requireAuth, aiController.evaluateShare);
router.post('/chat', requireAuth, aiController.chat);

module.exports = router;
