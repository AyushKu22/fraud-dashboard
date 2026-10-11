const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/transactionController');

router.use(protect);
router.get('/', c.list);
router.get('/:id', c.getOne);
router.post('/upload', authorize('admin'), upload.single('file'), c.upload);

module.exports = router;