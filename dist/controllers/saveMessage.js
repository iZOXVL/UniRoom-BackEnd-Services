"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMessage = void 0;
const db_1 = require("../lib/db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const JWT_SECRET = 'Un1R0Om202A*@*';
const saveMessage = async (req, res) => {
    try {
        const { chatId, content, nickname, token } = req.body;
        const tokenResponse = await axios_1.default.post('https://dev-mobile-auth-api.uniroom.app/api/users/verify-auth', { token });
        if (!tokenResponse.data.validateToken) {
            res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const senderId = decoded.userId;
        const newMessage = await db_1.db.message.create({
            data: {
                chatId,
                senderId,
                nickname,
                content,
                isRead: false,
            },
        });
        res.status(200).json({ status: 'success', message: newMessage });
    }
    catch (error) {
        console.error('Error al guardar el mensaje:', error);
        res.status(500).json({ status: 'error', message: 'Error al guardar el mensaje' });
    }
};
exports.saveMessage = saveMessage;
