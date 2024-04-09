const uuid = require('uuid');
const { Op } = require('sequelize');
const {Item} = require('../models/models');
const ApiError = require('../error/ApiError');
const { createImgUtils } = require('../utils/createImgUtils');
const { changeRotateUtils } = require('../utils/changeRotateUtils');
const s3 = require('../awsConfig');

class ItemController {
    async create(req, res, next) {
        try {
            const {name, price, description, typeId, subTypeId} = req.body
            const {img} = req.files
            let {rotate} = req.query
            rotate = parseInt(rotate, 10);

            const fileName = uuid.v4();
            
            let fileExtension;
            if (rotate > 0) {
                fileExtension = await createImgUtils(img, fileName, rotate);
            } else {
                fileExtension = await createImgUtils(img, fileName);
            }

            const item = await Item.create({
                name,
                price,
                description,
                typeId,
                subTypeId: JSON.parse(subTypeId),
                img: `${fileName}.${fileExtension}`,
            });

            return res.json(item)
        } catch(e) {
            next(ApiError.badRequest(e.errors ? e.errors[0].message : e.message))
        }
    }

    async getAll(req, res, next) {
        try {
            let {typeId, subTypeId, price, limit, page, sort} = req.query
            page = page || 1
            limit = limit || 5
            sort = sort || ["updatedAt", "DESC"]
            let offset = page * limit - limit
            let items;
            if (typeId && subTypeId && price) {
                items = await Item.findAndCountAll({
                    where : {
                        typeId, 
                        subTypeId: {[Op.contains]: [+subTypeId]},
                        price: {[Op.between]: [+price.priceLow, +price.priceMax]}
                    }, 
                    limit, offset,
                    order: [sort]
                })
            } else if (typeId && subTypeId) {
                items = await Item.findAndCountAll({
                    where : {
                        typeId, 
                        subTypeId: {[Op.contains]: [+subTypeId]}
                    }, 
                    limit, offset, 
                    order: [sort]})
            } else if (price) {
                items = await Item.findAndCountAll({
                    where : {price: {[Op.between]: [+price.priceLow, +price.priceMax]}}, limit, offset, 
                    order: [sort]
                })
            } else {
                items = await Item.findAndCountAll({limit, offset, order: [sort]})
            }

            return res.json(items)
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    }

    async getForIds(req, res) {
        const {ids} = req.query

        const items = await Item.findAll({where: {id: {[Op.or]: ids}}})
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
            let {rotate} = req.query
            rotate = parseInt(rotate, 10);

            const prevItem = await Item.findOne({where: {id}})

            if (rotate > 0 && !req.files) {
                await changeRotateUtils(rotate, prevItem)
            }

            let item;
            if (req.files) {
                const params = {
                    Bucket: process.env.BUCKET,
                    Key: prevItem.img,
                };

                await s3.deleteObject(params).promise();

                const {img} = req.files
                
                const fileName = uuid.v4();

                let fileExtension;
                if (rotate > 0) {
                    fileExtension = await createImgUtils(img, fileName, rotate);
                } else {
                    fileExtension = await createImgUtils(img, fileName);
                }

                item = await Item.update({...req.body, img: `${fileName}.${fileExtension}`}, {where: {id}})
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
        
        const params = {
            Bucket: process.env.BUCKET,
            Key: prevItem.img,
        };

        await s3.deleteObject(params).promise();
        
        const item = await Item.destroy({where: {id}})
        return res.json(item)
    }
}

module.exports = new ItemController()