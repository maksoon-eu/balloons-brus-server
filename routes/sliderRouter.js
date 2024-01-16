const Router = require('express')
const router = new Router()

const sliderController = require('../controllers/sliderController')
const checkRole = require('../middleware/checkRoleMiddleware')

router.post('/', checkRole('ADMIN'), sliderController.create)
router.get('/', sliderController.getAll)
router.put('/:id', checkRole('ADMIN'), sliderController.change)

module.exports = router