const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/caseController');

router.use(protect);
router.route('/').get(c.list).post(c.create);
router.get('/:id', c.validId, c.getOne);
router.patch('/:id', c.validId, c.updateStatus);
router.post('/:id/notes', c.validId, c.addNote);

module.exports = router;