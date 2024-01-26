const Router = require('express')
const router = new Router()

const userController = require('../controllers/userController')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/registration', checkRoleMiddleware('ADMIN'), userController.registration)
router.post('/login', userController.login)
router.get('/auth', authMiddleware, userController.check)

module.exports = router