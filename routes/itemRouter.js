const Router = require('express')
const router = new Router()

const itemController = require('../controllers/itemController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const cacheMiddleware = require('../middleware/cacheMiddleware')

router.post('/', checkRoleMiddleware('ADMIN'), itemController.create)
router.get('/', cacheMiddleware(3 * 60 * 60), itemController.getAll)
router.get('/ids', cacheMiddleware(3 * 60 * 60), itemController.getForIds)
router.get('/:id', cacheMiddleware(3 * 60 * 60), itemController.getOne)
router.put('/:id', checkRoleMiddleware('ADMIN'), itemController.change)
router.delete('/:id', checkRoleMiddleware('ADMIN'), itemController.delete)

module.exports = router