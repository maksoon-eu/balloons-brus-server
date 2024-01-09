const Router = require('express')
const router = new Router()

const orderController = require('../controllers/orderController')

router.post('/', orderController.sendOrder)
router.post('/message', orderController.sendMessage)

module.exports = router