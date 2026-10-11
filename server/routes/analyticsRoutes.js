const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/analyticsController');

router.use(protect);
router.get('/summary', c.summary);
router.get('/trends', c.trends);
router.get('/rules', c.rules);

module.exports = router;