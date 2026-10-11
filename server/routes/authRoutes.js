const router = require('express').Router();
const { signup, register, login, me, deleteMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.post('/register', protect, authorize('admin'), register);
router.get('/me', protect, me);
router.delete('/me', protect, deleteMe);

module.exports = router;