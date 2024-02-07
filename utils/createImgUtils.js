const heicConvert = require('heic-convert');
const sharp = require('sharp');
const { uploadImageToS3 } = require('../utils/imageUtils');

const createImgUtils = async (img, fileName, rotate = false) => {
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
        if (rotate) {
            imageBuffer = await sharp(data)
                .rotate(rotate)
                .toBuffer();
        } else {
            imageBuffer = await sharp(data)
                .rotate()
                .toBuffer();
        }
        fileExtension = 'jpeg';
    } else {
        if (rotate) {
            imageBuffer = await sharp(img.data)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .rotate(rotate)
                .toBuffer();
        } else {
            imageBuffer = await sharp(img.data)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .rotate()
                .toBuffer();
        }
        fileExtension = 'jpeg';
    }

    await uploadImageToS3(imageBuffer, `${fileName}.${fileExtension}`);

    return fileExtension;
}

module.exports = { createImgUtils };