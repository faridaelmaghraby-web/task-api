const router = require('express').Router();
const ctrl = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

router.use(protect); // all task routes require a valid JWT

router.route('/')
  .get(validate(schemas.listTasks, 'query'), ctrl.getTasks)
  .post(validate(schemas.createTask), ctrl.createTask);

router.route('/:id')
  .get(ctrl.getTask)
  .put(validate(schemas.updateTask), ctrl.updateTask)
  .patch(validate(schemas.updateTask), ctrl.updateTask)
  .delete(ctrl.deleteTask);

module.exports = router;
