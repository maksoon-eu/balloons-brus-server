const uuid = require('uuid')
const path = require('path')
const fs = require('fs');
const { Op } = require('sequelize')
const {Item} = require('../models/models')
const ApiError = require('../error/ApiError')

class ItemController {
    async create(req, res, next) {
        try {
            const {name, price, description, typeId, subTypeId} = req.body
            const {img} = req.files
            let fileName = uuid.v4() + '.jpg'

            const item = await Item.create({name, price, description, typeId, subTypeId, img: fileName})
            img.mv(path.resolve(__dirname, '..', 'static', fileName))

            return res.json(item)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {typeId, subTypeId, price, limit, page} = req.query
        page = page || 1
        limit = limit || 5
        let offset = page * limit - limit
        let items;
        if (typeId && subTypeId && price) {
            items = await Item.findAndCountAll({where : {typeId, subTypeId, price: {[Op.between]: [+price.priceLow, +price.priceMax]}}, limit, offset})
        } else if (typeId && subTypeId) {
            items = await Item.findAndCountAll({where : {typeId, subTypeId}, limit, offset})
        } else if (price) {
            items = await Item.findAndCountAll({where : {price: {[Op.between]: [+price.priceLow, +price.priceMax]}}, limit, offset})
        } else {
            items = await Item.findAndCountAll({limit, offset})
        }

        return res.json(items)
    }

    async getOne(req, res) {
        const {id} = req.params
        const item = await Item.findOne({where: {id}})
        return res.json(item)
    }

    async change(req, res, next) {
        try {
            const {id} = req.params

            const prevItem = await Item.findOne({where: {id}})
            fs.unlinkSync(`${__dirname}/../static/${prevItem.img}`)

            let item;
            if (req.files) {
                const {img} = req.files
                let fileName = uuid.v4() + '.jpg'
                img.mv(path.resolve(__dirname, '..', 'static', fileName))

                item = await Item.update({...req.body, img: fileName}, {where: {id}})
            } else {
                item = await Item.update({...req.body}, {where: {id}})
            }

            return res.json(item)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async delete(req, res) {
        const {id} = req.params

        const prevItem = await Item.findOne({where: {id}})
        fs.unlinkSync(`${__dirname}/../static/${prevItem.img}`)
        
        const item = await Item.destroy({where: {id}})
        return res.json(item)
    }
}

module.exports = new ItemController()