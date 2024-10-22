"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatsByUser = void 0;
const db_1 = require("../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const JWT_SECRET = process.env.JWT_SECRET;
const getChatsByUser = async (req, res) => {
    try {
        const { token } = req.params;
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
        if (!tokenResponse.data.validateToken) {
            res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const chats = await db_1.db.chat.findMany({
            where: {
                participants: { has: userId },
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (!chats.length) {
            res.status(404).json({ status: 'error', message: 'No se encontraron chats para este usuario.' });
            return;
        }
        const chatData = await Promise.all(chats.map(async (chat) => {
            const lastMessage = await db_1.db.message.findFirst({
                where: { chatId: chat.id },
                orderBy: { timestamp: 'desc' },
            });
            return { ...chat, lastMessage: lastMessage?.content || null, lastMessageTime: lastMessage?.timestamp || chat.updatedAt };
        }));
        res.status(200).json({ status: 'success', chats: chatData });
    }
    catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener los chats' });
    }
};
exports.getChatsByUser = getChatsByUser;
