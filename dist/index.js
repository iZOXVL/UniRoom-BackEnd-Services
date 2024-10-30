"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = __importDefault(require("./routes/routes"));
const db_1 = require("./lib/db");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const PORT = 4000;
const verifyTokenApi = process.env.VERIFY_TOKEN_API;
const userInfoApi = 'https://dev-mobile-auth-api.uniroom.app/api/users/user-info';
const JWT_SECRET = process.env.JWT_SECRET;
// Crear el servidor con módulo http
const server = http_1.default.createServer(app);
// Configurar CORS para Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
// Middlewares
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
app.use(routes_1.default);
// Eventos de Socket.io
io.on('connection', (socket) => {
    // Evento para unirse a una sala de chat
    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`Usuario conectado a la sala ${chatId}`);
    });
    // Evento para recibir y retransmitir mensajes
    socket.on('message', async (messageData) => {
        const { chatId, content, token } = messageData;
        try {
            // Verificar el token
            const tokenResponse = await axios_1.default.post(verifyTokenApi, { token });
            if (!tokenResponse.data.validateToken) {
                socket.emit('error', { message: 'Token no válido. Usuario no autenticado.' });
                return;
            }
            // Decodificar el token para obtener el senderId
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            const senderId = decoded.userId;
            // Obtener el nombre del usuario
            const userInfoResponse = await axios_1.default.post(userInfoApi, { userId: senderId });
            if (!userInfoResponse.data.success) {
                socket.emit('error', { message: 'No se pudo recuperar la información del usuario.' });
                return;
            }
            const senderName = userInfoResponse.data.user.name;
            // Crear el mensaje en la base de datos
            const newMessage = await db_1.db.message.create({
                data: {
                    chatId,
                    senderId,
                    nickname: senderName,
                    content,
                    isRead: false,
                },
            });
            // Emitir el mensaje a todos los usuarios conectados al chat, incluyendo fecha y hora
            socket.broadcast.to(chatId).emit('message', {
                chatId,
                content,
                from: senderName,
                timestamp: newMessage.timestamp,
            });
        }
        catch (error) {
            console.error('Error al guardar el mensaje:', error);
            socket.emit('error', { message: 'Error al guardar el mensaje' });
        }
    });
    // Evento para actualizar el estado del chat
    socket.on('updateChatStatus', async (chatId, status) => {
        try {
            // Actualizar el estado del chat usando Prisma
            const chat = await db_1.db.chat.update({
                where: { id: chatId },
                data: { status },
            });
            io.to(chatId).emit('chatStatusUpdated', { chatId, status });
        }
        catch (error) {
            console.error('Error al actualizar el estado del chat:', error);
            socket.emit('error', { message: 'Error al actualizar el estado del chat' });
        }
    });
    // Evento para obtener todos los chats de un usuario específico
    socket.on('getUserChats', async (userId) => {
        try {
            const chats = await db_1.db.chat.findMany({
                where: {
                    participants: { has: userId }
                },
                orderBy: { updatedAt: 'desc' },
            });
            if (chats.length > 0) {
                socket.emit('userChats', { status: 'Success', chats });
            }
            else {
                socket.emit('userChats', { status: 'error', message: 'No se encontraron chats para este usuario.' });
            }
        }
        catch (error) {
            console.error('Error al obtener los chats del usuario:', error);
            socket.emit('error', { message: 'Error al obtener los chats' });
        }
    });
    // Evento al desconectar un cliente
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});
// Escucha del servidor en el puerto 4000
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
