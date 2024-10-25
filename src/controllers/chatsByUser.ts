import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { db } from '../lib/db';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;  

export const getChatsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    // Verificar el token de usuario a través de la API
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    // Decodificar el token para obtener el userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Obtener los chats donde el usuario es participante
    const chats = await db.chat.findMany({
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
      const lastMessage = await db.message.findFirst({
        where: { chatId: chat.id },
        orderBy: { timestamp: 'desc' },
      });

      // Obtener los nombres de los participantes del chat
      const participantsWithNames = await Promise.all(
        chat.participants.map(async (participantId: string) => {
          try {
            const response = await axios.post('https://dev-mobile-auth-api.uniroom.app/api/users/user-info', {
              userId: participantId,
            });
            return {
              id: participantId,
              name: response.data.user.name,
              email: response.data.user.email,
            };
          } catch (error) {
            console.error(`Error al obtener el nombre del participante ${participantId}:`, error);
            return {
              id: participantId,
              name: 'Nombre no disponible',
              email: 'Email no disponible',
            };
          }
        })
      );

      return {
        ...chat,
        participants: participantsWithNames,
        lastMessage: lastMessage?.content || null,
        lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
      };
    }));

    res.status(200).json({ status: 'success', chats: chatData });
  } catch (error) {
    console.error('Error al obtener los chats:', error);
    res.status(200).json({ status: 'error', message: 'Error al obtener los chats, revisa que el token sea valido' });
  }
};
