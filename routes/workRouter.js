const Router = require('express')
const router = new Router()

const workController = require('../controllers/workController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), workController.create)
router.get('/', workController.getAll)
router.delete('/:id', checkRole('ADMIN'), workController.delete)
router.put('/:id', checkRole('ADMIN'), workController.change)

module.exports = router