import { Request, Response } from 'express';
import { db } from '../lib/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export const saveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, content, token } = req.body;

    // Verificación del token
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    const guest = tokenResponse.data.user;

    // Decodificar token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const senderId = decoded.userId;

    // Crear el nuevo mensaje
    const newMessage = await db.message.create({
      data: {
        chatId,
        senderId,
        nickname: guest.name,
        content,
        isRead: false,
      },
    });

    
    const io = req.app.get('socketio');
    const socket = req.app.get('socket'); 
    io.to(chatId).emit('message', {
      chatId,
      content,
      from: guest.name,
    });

    // Evitar que el emisor reciba su propio mensaje
    io.to(chatId).except(socket.id).emit('message', {
      chatId,
      content,
      from: guest.name,
    });

    res.status(200).json({ status: 'success', message: newMessage });
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(200).json({ status: 'error', message: 'Error al guardar el mensaje' });
  }
};
