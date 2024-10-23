"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = void 0;
const db_1 = require("../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const JWT_SECRET = process.env.JWT_SECRET;
const saveMessage = async (req, res) => {
    try {
        const { chatId, content, token } = req.body;
        // Verificación del token
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
        if (!tokenResponse.data.validateToken) {
            res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        const guest = tokenResponse.data.user;
        // Decodificar token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const senderId = decoded.userId;
        // Crear el nuevo mensaje
        const newMessage = await db_1.db.message.create({
            data: {
                chatId,
                senderId,
                nickname: guest.name,
                content,
                isRead: false,
            },
        });
        // Emitir el mensaje a todos los usuarios conectados a ese chat a través de Socket.io
        const io = req.app.get('socketio');
        io.to(chatId).emit('message', {
            chatId,
            content,
            from: guest.name,
        });
        res.status(200).json({ status: 'success', message: newMessage });
    }
    catch (error) {
        console.error('Error al guardar el mensaje:', error);
        res.status(200).json({ status: 'error', message: 'Error al guardar el mensaje' });
    }
};
exports.saveMessage = saveMessage;
