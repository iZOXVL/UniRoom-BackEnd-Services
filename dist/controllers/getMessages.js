"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessages = void 0;
const db_1 = require("../lib/db");
const getMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const chat = await db_1.db.chat.findUnique({ where: { id: chatId } });
        if (!chat) {
            res.status(404).json({ status: 'error', message: 'Chat no encontrado' });
            return;
        }
        const messages = await db_1.db.message.findMany({
            where: { chatId },
            orderBy: { timestamp: 'asc' },
        });
        res.status(200).json({
            status: 'success',
            chatDetails: {
                participants: chat.participants,
                room: chat.room,
                status: chat.status,
            },
            messages,
        });
    }
    catch (error) {
        console.error('Error al obtener los mensajes:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los mensajes del chat' });
    }
};
exports.getMessages = getMessages;
