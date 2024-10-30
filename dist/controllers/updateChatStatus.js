"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateChatStatus = void 0;
const db_1 = require("../lib/db"); // Prisma client configurado
const mail_1 = require("../lib/mail");
const updateChatStatus = async (req, res) => {
    try {
        const { chatId, status, email, title } = req.body;
        // Validar que el status sea 'approved' o 'refused'
        if (status !== 'approved' && status !== 'refused') {
            res.status(400).json({ status: 'error', message: 'Status no válido. Solo se acepta "approved" o "refused".' });
            return;
        }
        // Buscar el chat por ID
        const chat = await db_1.db.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            res.status(404).json({ status: 'error', message: 'Chat no encontrado.' });
            return;
        }
        // Actualizar el status del chat al valor recibido en el body
        const updatedChat = await db_1.db.chat.update({
            where: { id: chatId },
            data: { status },
        });
        // Enviar notificación solo si el status es 'approved'
        if (status === 'approved') {
            (0, mail_1.sendApprovalNotificationEmail)(email, title);
        }
        if (status === 'refused') {
            (0, mail_1.sendRefusedNotificationEmail)(email, title);
        }
        res.status(200).json({ status: 'success', message: `La solicitud fue ${status}.`, chat: updatedChat });
    }
    catch (error) {
        console.error('Error al actualizar el chat:', error);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el chat.' });
    }
};
exports.updateChatStatus = updateChatStatus;
