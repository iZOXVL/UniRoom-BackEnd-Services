"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChat = void 0;
const db_1 = require("../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const JWT_SECRET = process.env.JWT_SECRET;
const createChat = async (req, res) => {
    try {
        const { landlord, token, room } = req.body;
        // Verificación del token
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
        if (!tokenResponse.data.validateToken) {
            res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        // Decodificación del token JWT
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const guestId = decoded.userId;
        // Buscar chat existente
        const existingChat = await db_1.db.chat.findFirst({
            where: {
                AND: [
                    { participants: { has: landlord.id } },
                    { participants: { has: guestId } },
                    { roomId: room.roomId }
                ],
            },
        });
        console.log('existingChat:', existingChat);
        // Si ya existe un chat para esa habitación
        if (existingChat) {
            res.status(400).json({ status: 'error', message: 'Ya existe una solicitud para esta habitación.' });
            return;
        }
        // Crear nuevo chat
        const newChat = await db_1.db.chat.create({
            data: {
                participants: [landlord.id, guestId],
                status: 'pending',
                roomId: room.roomId,
            },
        });
        res.status(200).json({ status: 'success', chat: newChat });
    }
    catch (error) {
        console.error('Error al crear el chat:', error);
        res.status(500).json({ status: 'error', message: 'Error al crear el chat' });
    }
};
exports.createChat = createChat;
