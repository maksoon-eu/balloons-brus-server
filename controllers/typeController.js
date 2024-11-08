const { Type, SubType, Item, SliderType } = require('../models/models');
const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');

class TypeController {
    async create(req, res, next) {
        try {
            const { name } = req.body;
            const type = await Type.create({ name });

            return res.json(type);
        } catch (e) {
            next(ApiError.internal(e.errors ? e.errors[0].message : e.message));
        }
    }

    async createSubType(req, res, next) {
        try {
            const { id, name } = req.body;

            const type = await Type.findOne({ where: { id } });

            const subType = await SubType.create({ name, typeId: type.id });

            return res.json(subType);
        } catch (e) {
            next(ApiError.internal(e.errors ? e.errors[0].message : e.message));
        }
    }

    async deleteSubType(req, res, next) {
        try {
            const { id } = req.params;

            const item = await Item.findOne({
                where: {
                    subTypeId: { [Op.contains]: [+id] },
                },
            });

            if (item) {
                const changedSubTypeId = item.subTypeId.filter((subType) => +subType !== +id);

                if (changedSubTypeId.length) {
                    await Item.update(
                        { subTypeId: changedSubTypeId },
                        { where: { subTypeId: { [Op.contains]: [+id] } } }
                    );
                } else {
                    await Item.destroy({
                        where: {
                            subTypeId: { [Op.contains]: [+id] },
                        },
                    });

                    const params = {
                        Bucket: process.env.BUCKET,
                        Key: item.img,
                    };

                    await s3.deleteObject(params).promise();
                }
            }

            const subType = await SubType.destroy({ where: { id } });

            return res.json(subType);
        } catch (e) {
            next(ApiError.internal(e.errors ? e.errors[0].message : e.message));
        }
    }

    async getAll(req, res) {
        const types = await Type.findAll({ include: [{ model: SubType, as: 'subType' }] });
        return res.json(types);
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;

            const item = await Item.findOne({ where: { typeId: id } });

            if (item) {
                await Item.destroy({ where: { typeId: id } });

                const params = {
                    Bucket: process.env.BUCKET,
                    Key: item.img,
                };

                await s3.deleteObject(params).promise();
            }

            const subType = await SubType.findOne({ where: { typeId: id } });
            if (subType) {
                await SubType.destroy({ where: { typeId: id } });
            }

            const type = await Type.destroy({ where: { id } });

            return res.json(type);
        } catch (e) {
            next(ApiError.internal(e.errors ? e.errors[0].message : e.message));
        }
    }

    async sliderType(req, res) {
        console.log(1 + '\n\n\n\n\n');
        const sliderType = await SliderType.findAll();

        return res.json(sliderType);
    }

    async changeSliderType(req, res) {
        const { id } = req.params;
        const { typeId, subTypeId } = req.body;

        const sliderType = await SliderType.update({ typeId, subTypeId }, { where: { id } });

        return res.json(sliderType);
    }
}

module.exports = new TypeController();
