const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/projectController');
router.post('/', auth, c.createProject);
router.get('/', auth, c.getProjects);
router.get('/:id', auth, c.getProject);
router.put('/:id', auth, c.updateProject);
router.delete('/:id', auth, c.deleteProject);
module.exports = router;
