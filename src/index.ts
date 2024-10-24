
import express from 'express';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http, { get } from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './routes/routes';
import { db } from './lib/db'; 
import axios from 'axios';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4000;


// Crear el servidor con módulo http
const server = http.createServer(app);

// Configurar CORS para Socket.io
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(router);

// Eventos de Socket.io
io.on('connection', (socket) => {
 

  // Evento para unirse a una sala de chat
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Usuario conectado a la sala ${chatId}`);
  });

  // Evento para recibir y retransmitir mensajes
  socket.on('message', async (messageData) => {
    const { chatId, content, nickname, token } = messageData;

   

    // Verificar el token y guardar el mensaje en la base de datos usando Prisma
    const tokenResponse = await axios.post(process.env.VERIFY_TOKEN_API as string, { token });
    if (!tokenResponse.data.validateToken) {
      socket.emit('error', { message: 'Token no válido. Usuario no autenticado.' });
      return;
    }


      // Emitir el mensaje a todos los usuarios conectados a ese chat (excepto al emisor)
      socket.broadcast.to(chatId).emit('message', {
        chatId,
        content,
        from: nickname,
      });

   
  });

  // Evento para actualizar el estado del chat
  socket.on('updateChatStatus', async (chatId, status) => {
    try {
      // Actualizar el estado del chat usando Prisma
      const chat = await db.chat.update({
        where: { id: chatId },
        data: { status },
      });

      io.to(chatId).emit('chatStatusUpdated', { chatId, status });

    } catch (error) {
      console.error('Error al actualizar el estado del chat:', error);
      socket.emit('error', { message: 'Error al actualizar el estado del chat' });
    }
  });

  // Evento para obtener todos los chats de un usuario específico
  socket.on('getUserChats', async (userId) => {
    try {
      const chats = await db.chat.findMany({
        where: {
          participants: { has: userId }
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (chats.length > 0) {
        socket.emit('userChats', { status: 'Success', chats });
      } else {
        socket.emit('userChats', { status: 'error', message: 'No se encontraron chats para este usuario.' });
      }
    } catch (error) {
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
