const uuid = require('uuid');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const {Item} = require('../models/models');
const ApiError = require('../error/ApiError');
const heicConvert = require('heic-convert');

class ItemController {
    async create(req, res, next) {
        try {
            const {name, price, description, typeId, subTypeId} = req.body

            const {img} = req.files
            
            const fileName = uuid.v4();
            
            let fileExtension = img.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'heic'];

            if (!allowedExtensions.includes(fileExtension)) {
                throw new Error('Недопустимый формат изображения. Разрешены: jpg, jpeg, png, gif, bmp, tiff, webp, heic.');
            }

            let imageBuffer;

            if (fileExtension === 'heic') {
                const { data } = await heicConvert({
                    buffer: img.data,
                    format: 'jpeg',
                    quality: 90,
                });
                imageBuffer = data;
                fileExtension = 'jpeg';
            } else {
                imageBuffer = await sharp(img.data)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toBuffer();
                fileExtension = 'jpeg';
            }

            const item = await Item.create({
                name,
                price,
                description,
                typeId,
                subTypeId,
                img: `${fileName}.${fileExtension}`,
            });

            fs.writeFileSync(path.resolve(__dirname, '..', 'static', `${fileName}.${fileExtension}`), imageBuffer);

            return res.json(item)
        } catch(e) {
            console.log(e)
            next(ApiError.badRequest(e.message))
        }
    }

    async getAll(req, res) {
        let {typeId, subTypeId, price, limit, page, sort} = req.query
        page = page || 1
        limit = limit || 5
        sort = sort || ["updatedAt", "DESC"]
        let offset = page * limit - limit
        let items;
        if (typeId && subTypeId && price) {
            items = await Item.findAndCountAll({
                where : {typeId, subTypeId, 
                    price: {[Op.between]: [+price.priceLow, +price.priceMax]}
                }, 
                limit, offset, 
                order: [sort]
            })
        } else if (typeId && subTypeId) {
            items = await Item.findAndCountAll({where : {typeId, subTypeId}, limit, offset, order: [sort]})
        } else if (price) {
            items = await Item.findAndCountAll({
                where : {price: {[Op.between]: [+price.priceLow, +price.priceMax]}}, limit, offset, 
                order: [sort]
            })
        } else {
            items = await Item.findAndCountAll({limit, offset, order: [sort]})
        }

        return res.json(items)
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

            const prevItem = await Item.findOne({where: {id}})

            let item;
            if (req.files) {
                fs.unlinkSync(`${__dirname}/../static/${prevItem.img}`)
                const {img} = req.files
                
                const fileName = uuid.v4();
            
                let fileExtension = img.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'heic'];

                if (!allowedExtensions.includes(fileExtension)) {
                    throw new Error('Недопустимый формат изображения. Разрешены: jpg, jpeg, png, gif, bmp, tiff, webp, heic.');
                }

                let imageBuffer;

                if (fileExtension === 'heic') {
                    const { data } = await heicConvert({
                        buffer: img.data,
                        format: 'jpeg',
                        quality: 90,
                    });
                    imageBuffer = data;
                    fileExtension = 'jpeg';
                } else {
                    imageBuffer = await sharp(img.data)
                        .toFormat('jpeg')
                        .jpeg({ quality: 90 })
                        .toBuffer();
                    fileExtension = 'jpeg';
                }

                item = await Item.update({...req.body, img: `${fileName}.${fileExtension}`}, {where: {id}})
                
                fs.writeFileSync(path.resolve(__dirname, '..', 'static', `${fileName}.${fileExtension}`), imageBuffer);
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