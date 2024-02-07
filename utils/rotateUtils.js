const sharp = require('sharp');

const rotateUtils = async (imgBuffer, rotate) => {
    const sharpInstance = sharp(imgBuffer);

    sharpInstance.rotate(parseInt(rotate, 10));

    return await sharpInstance.toBuffer();
};

module.exports = { rotateUtils };