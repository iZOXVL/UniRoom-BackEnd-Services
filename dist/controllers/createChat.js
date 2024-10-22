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
        const tokenResponse = await axios_1.default.post(verifyTokenApi, { token: token });
        if (!tokenResponse.data.validateToken) {
            res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const guestId = decoded.userId;
        console.log('landlord:', landlord.id, 'guestId:', guestId, 'room:', room.roomId);
        const existingChat = await db_1.db.chat.findFirst({
            where: {
                AND: [
                    { participants: { has: landlord.id } },
                    { participants: { has: guestId } },
                    { room: { equals: room.roomId } }
                ],
            },
        });
        console.log('existingChat:', existingChat);
        if (existingChat) {
            res.status(400).json({ status: 'error', message: 'Ya existe una solicitud para esta habitación.' });
            return;
        }
        const newChat = await db_1.db.chat.create({
            data: {
                participants: [
                    { userId: landlord.id, name: landlord.name, imageUrl: landlord.imageUrl, isOnline: false },
                    { userId: guestId, name: tokenResponse.data.user.name, imageUrl: tokenResponse.data.user.image }
                ],
                status: 'earring',
                room: {
                    roomId: room.roomId,
                    title: room.title,
                    imageUrl: room.imageUrl,
                    location: room.location,
                    price: room.price,
                },
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
