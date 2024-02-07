const Router = require('express')
const router = new Router()

const reviewController = require('../controllers/reviewController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), reviewController.create)
router.get('/', reviewController.getAll)
router.delete('/:id', checkRole('ADMIN'), reviewController.delete)
router.put('/:id', checkRole('ADMIN'), reviewController.change)

module.exports = router