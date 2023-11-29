const Router = require('express')
const router = new Router()

const itemController = require('../controllers/itemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const cacheMiddleware = require('../middleware/cacheMiddleware')

router.post('/', checkRoleMiddleware('ADMIN'), itemController.create)
router.get('/', itemController.getAll)
router.get('/:id', itemController.getOne)
router.put('/:id', checkRoleMiddleware('ADMIN'), itemController.change)
router.delete('/:id', checkRoleMiddleware('ADMIN'), itemController.delete)

module.exports = router