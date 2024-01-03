const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User} = require('../models/models');
const ApiError = require('../error/ApiError');

const generateToken = (id, login, role) => {
    return jwt.sign(
        {id: id, login, role}, 
        process.env.SECRET_KEY,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        const {login, password, role} = req.body
        if (!login || !password) {
            return next(ApiError.badRequest('Некорректный логин или пароль'))
        }
        const candidate = await User.findOne({where:{login}})
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({login, role, password: hashPassword})
        const token = generateToken(user.id, user.login, user.role)
        return res.json({token})
    }

    async login(req, res, next) {
        const {login, password} = req.body
        if (!login || !password) {
            return next(ApiError.badRequest('Некорректный логин или пароль'))
        }
        const user = await User.findOne({where:{login}})
        if (!user) {
            return next(ApiError.badRequest('Пользователя с таким логином не существует'))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Неправильный пароль'))
        }
        const token = generateToken(user.id, user.login, user.role)
        return res.json({token})
    }

    async check(req, res) {
        const token = generateToken(req.user.id, req.user.login, req.user.role)
        return res.json({token})
    }
}

module.exports = new UserController()