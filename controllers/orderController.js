const axios = require('axios');
const ApiError = require('../error/ApiError')

class OrderController {
    async sendOrder(req, res, next) {
        try {
            let message = '';
            const order = req.body
            JSON.parse(order.products).forEach((product, index) => {
                message += `Товар ${index + 1}:\n`;
                message += `Название: ${product.name}\n`;
                message += `Количество: ${JSON.parse(order.quality)[index][1]}\n`;
                message += '\n';
            });
            message += `Заказчик:\n`;
            message += `Имя: ${order.name}\n`;
            message += `Номер телефона: ${order.tel}\n`;
            message += `Адрес доставки: ${order.address}\n`;
            message += `Дата доставки: ${order.date}\n`;
            message += `Время доставки: ${order.time}\n`;
            message += `Комментарий к заказу: ${order.comment}\n\n`;
            message += `Итоговая стоимоть: ${order.price} ₽`;

            const telegramUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
            const telegramParams = {
                chat_id: process.env.CHAT_ID,
                text: message,
            };

            await axios.post(telegramUrl, telegramParams);

            return res.json({ message: 'Сообщение успешно отправлено в Telegram' })
        } catch(e) {
            next(ApiError.badRequest(e.message))
        }
    };
}

module.exports = new OrderController()