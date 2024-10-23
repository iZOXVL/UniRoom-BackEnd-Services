import express from 'express';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
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
app.set('socketio', io);


io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Evento para unirse a una sala de chat
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Cliente ${socket.id} se ha unido al chat: ${chatId}`);
  });

  // Evento para recibir y retransmitir mensajes
  socket.on('message', async (messageData) => {
    const { chatId, content, nickname, token } = messageData;

    console.log(`Mensaje recibido en el chat ${chatId}:`, content);

    // Verificar el token y guardar el mensaje en la base de datos usando Prisma
    const tokenResponse = await axios.post(process.env.VERIFY_TOKEN_API as string, { token });
    if (!tokenResponse.data.validateToken) {
      socket.emit('error', { message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const senderId = decoded.userId;

    try {
      // Guardar el nuevo mensaje en la base de datos
      const newMessage = await db.message.create({
        data: {
          chatId,
          senderId,
          nickname,
          content,
          isRead: false,
        },
      });

      // Emitir el mensaje a todos los usuarios conectados a ese chat (excepto al emisor)
      socket.broadcast.to(chatId).emit('message', {
        chatId,
        content,
        from: nickname,
      });

      console.log(`Mensaje guardado y transmitido en el chat ${chatId}`);
    } catch (error) {
      console.error('Error al guardar el mensaje:', error);
      socket.emit('error', { message: 'Error al guardar el mensaje' });
    }
  });
});


// Escucha del servidor en el puerto 4000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
