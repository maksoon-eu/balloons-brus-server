const Router = require('express')
const router = new Router()

const itemRouter = require('./itemRouter')
const reviewRouter = require('./reviewRouter')
const userRouter = require('./userRouter')
const typeRouter = require('./typeRouter')
const workRouter = require('./workRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/item', itemRouter)
router.use('/review', reviewRouter)
router.use('/work', workRouter)

module.exports = router