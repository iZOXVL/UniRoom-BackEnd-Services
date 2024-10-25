import { Request, Response } from 'express';
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

    // Buscar todos los mensajes del chat sin paginación
    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    });

    // Respuesta con los detalles completos del chat y la habitación
    res.status(200).json({
      status: 'success',
      chatDetails: {
        participants: chat.participants,
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
