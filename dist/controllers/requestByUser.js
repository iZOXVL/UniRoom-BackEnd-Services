"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestByUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../lib/db");
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const JWT_SECRET = process.env.JWT_SECRET;
const getRequestByUser = async (req, res) => {
    try {
        const { token } = req.params;
        const { status, roomId } = req.body; // Agregar roomId al cuerpo de la solicitud
        // Verificar el token de usuario a través de la API
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
        if (!tokenResponse.data.validateToken) {
            res.status(200).json({ status: "error", message: "Token no válido. Usuario no autenticado." });
            return;
        }
        // Decodificar el token para obtener el userId
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        // Crear filtro base para la búsqueda
        const filter = {
            participants: { has: userId },
            status: status,
            ...(roomId && { roomId }) // Filtrar por roomId si está presente
        };
        const chats = await db_1.db.chat.findMany({
            where: filter,
            orderBy: { updatedAt: "desc" },
        });
        if (!chats.length) {
            res.status(200).json({ status: "error", message: "No se encontraron chats para este usuario." });
            return;
        }
        const chatData = await Promise.all(chats.map(async (chat) => {
            const lastMessage = await db_1.db.message.findFirst({
                where: { chatId: chat.id },
                orderBy: { timestamp: "desc" },
            });
            const participantsWithNames = await Promise.all(chat.participants.map(async (participantId) => {
                try {
                    const response = await axios_1.default.post("https://dev-mobile-auth-api.uniroom.app/api/users/user-info", {
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
                        name: "Nombre no disponible",
                        email: "Email no disponible",
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
        res.status(200).json({ status: "success", chats: chatData });
    }
    catch (error) {
        console.error("Error al obtener los chats:", error);
        res.status(200).json({ status: "error", message: "Error al obtener los chats, revisa que el token sea valido" });
    }
};
exports.getRequestByUser = getRequestByUser;
