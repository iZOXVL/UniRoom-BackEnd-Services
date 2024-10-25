import { Request, Response } from 'express';
import axios from 'axios';
import { db } from '../lib/db';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;

    // Buscar el chat y los detalles de la habitación
    const chat = await db.chat.findUnique({ 
      where: { id: chatId },
    });

    if (!chat) {
      res.status(200).json({ status: 'error', message: 'Chat no encontrado' });
      return;
    }

    // Obtener el nombre de cada participante a través de la API externa
    const participantsWithNames = await Promise.all(
      chat.participants.map(async (participantId: string) => {
        try {
          const response = await axios.post('https://dev-mobile-auth-api.uniroom.app/api/users/user-info', {
            userId: participantId,
          });
          return {
            id: participantId,
            name: response.data.user.name,
          };
        } catch (error) {
          console.error(`Error al obtener el nombre del participante ${participantId}:`, error);
          return {
            id: participantId,
            name: 'Nombre no disponible',
          };
        }
      })
    );

    // Buscar todos los mensajes del chat sin paginación
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    });

    // Respuesta con los detalles completos del chat y la habitación
    res.status(200).json({
      status: 'success',
      chatDetails: {
        participants: participantsWithNames,
        roomId: chat.roomId,
        roomDetails: chat.roomDetails,
        status: chat.status,
      },
      messages,
    });
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(200).json({ status: 'error', message: 'Error al obtener los mensajes del chat' });
  }
};
