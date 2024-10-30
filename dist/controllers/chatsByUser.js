"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatsByUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../lib/db");
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const JWT_SECRET = process.env.JWT_SECRET;
const getChatsByUser = async (req, res) => {
    try {
        const { token } = req.params;
        // Verificar el token de usuario a través de la API
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
        if (!tokenResponse.data.validateToken) {
            res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        // Decodificar el token para obtener el userId
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        // Obtener los chats donde el usuario es participante
        const chats = await db_1.db.chat.findMany({
            where: {
                participants: { has: userId },
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (!chats.length) {
            res.status(200).json({ status: 'error', message: 'No se encontraron chats para este usuario.' });
            return;
        }
        // Procesar cada chat y obtener el último mensaje y los nombres de los participantes
        const chatData = await Promise.all(chats.map(async (chat) => {
            // Obtener el último mensaje del chat
            const lastMessage = await db_1.db.message.findFirst({
                where: { chatId: chat.id },
                orderBy: { timestamp: 'desc' },
            });
            // Obtener los nombres de los participantes del chat
            const participantsWithNames = await Promise.all(chat.participants.map(async (participantId) => {
                try {
                    const response = await axios_1.default.post('https://dev-mobile-auth-api.uniroom.app/api/users/user-info', {
                        userId: participantId,
                    });
                    return {
                        id: participantId,
                        name: response.data.user.name,
                        email: response.data.user.email,
                    };
                }
                catch (error) {
                    console.error(`Error al obtener el nombre del participante ${participantId}:`, error);
                    return {
                        id: participantId,
                        name: 'Nombre no disponible',
                        email: 'Email no disponible',
                    };
                }
            }));
            return {
                ...chat,
                participants: participantsWithNames,
                lastMessage: lastMessage?.content || null,
                lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
            };
        }));
        res.status(200).json({ status: 'success', chats: chatData });
    }
    catch (error) {
        console.error('Error al obtener los chats:', error);
        res.status(200).json({ status: 'error', message: 'Error al obtener los chats, revisa que el token sea valido' });
    }
};
exports.getChatsByUser = getChatsByUser;
