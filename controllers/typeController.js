const {Type, SubType, Item, SliderType} = require('../models/models')
const fs = require('fs');
const ApiError = require('../error/ApiError')

class TypeController {
    async create(req, res) {
        const {name} = req.body
        const type = await Type.create({name})

        return res.json(type)
    }

    async createSubType(req, res) {
        const {id, name} = req.body

        const type = await Type.findOne({where: {id}})

        const subType = await SubType.create({name, typeId: type.id})
        return res.json(subType)
    }

    async deleteSubType(req, res) {
        const {id} = req.params

        const item = await Item.findOne({where: {subTypeId: id}})
        if (item) {
            fs.unlinkSync(`${__dirname}/../static/${item.img}`)
        }

        await Item.destroy({where: {subTypeId: id}})
        const subType = await SubType.destroy({where: {id}})
        return res.json(subType)
    }

    async getAll(req, res) {
        const types = await Type.findAll({include: [{model: SubType, as: 'subType'}]})
        return res.json(types)
    }

    async delete(req, res) {
        const {id} = req.params

        const item = await Item.findOne({where: {typeId: id}})
        if (item) {
            fs.unlinkSync(`${__dirname}/../static/${item.img}`)
        }

        await Item.destroy({where: {typeId: id}})
        await SubType.destroy({where: {typeId: id}})
        const type = await Type.destroy({where: {id}})

        return res.json(type)
    }

    async sliderType(req, res) {
        const sliderType = await SliderType.findAll()

        return res.json(sliderType)
    }

    async changeSliderType(req, res) {
        const {id} = req.params
        const {typeId, subTypeId} = req.body

        const sliderType = await SliderType.update({typeId, subTypeId}, {where: {id}})

        return res.json(sliderType)
    }
}

module.exports = new TypeController()