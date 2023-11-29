const Router = require('express')
const router = new Router()

const typeController = require('../controllers/typeController')
const checkRole = require('../middleware/checkRoleMiddleware')
const cacheMiddleware = require('../middleware/cacheMiddleware')

router.post('/', checkRole('ADMIN'), typeController.create)
router.get('/', typeController.getAll)
router.delete('/:id', checkRole('ADMIN'), typeController.delete)
router.post('/subType', checkRole("ADMIN"), typeController.createSubType)
router.delete('/subType/:id', checkRole("ADMIN"), typeController.deleteSubType)
router.get('/sliderType', typeController.sliderType)
router.put('/sliderType/:id', checkRole("ADMIN"), typeController.changeSliderType)

module.exports = router