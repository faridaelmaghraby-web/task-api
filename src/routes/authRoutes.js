const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.get('/me', protect, me);

module.exports = router;
