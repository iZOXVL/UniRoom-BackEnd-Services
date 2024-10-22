"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const db_1 = require("../lib/db");
const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const chat = await db_1.db.chat.findUnique({ where: { id: chatId } });
        if (!chat) {
            res.status(404).json({ status: 'error', message: 'Chat no encontrado' });
            return;
        }
        const messages = await db_1.db.message.findMany({
            where: { chatId },
            orderBy: { timestamp: 'asc' },
            skip: skip,
            take: limit,
        });
        const totalMessages = await db_1.db.message.count({
            where: { chatId },
        });
        res.status(200).json({
            status: 'success',
            chatDetails: {
                participants: chat.participants,
                room: chat.roomId,
                status: chat.status,
            },
            messages,
            pagination: {
                totalMessages,
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
            },
        });
    }
    catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los mensajes del chat' });
    }
};
exports.getMessages = getMessages;
