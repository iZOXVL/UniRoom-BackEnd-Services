import { Request, Response } from 'express';
import { db } from '../lib/db';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10; 


    const skip = (page - 1) * limit;

    const chat = await db.chat.findUnique({ where: { id: chatId } });

    if (!chat) {
      res.status(404).json({ status: 'error', message: 'Chat no encontrado' });
      return;
    }

    const messages = await db.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
      skip: skip,
      take: limit,  
    });

    const totalMessages = await db.message.count({
      where: { chatId },
    });

    res.status(200).json({
      status: 'success',
      chatDetails: {
        participants: chat.participants,
        room: chat.roomId,
        status: chat.status,
      },
      messages,
      pagination: {
        totalMessages, 
        currentPage: page, 
        totalPages: Math.ceil(totalMessages / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener los mensajes:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los mensajes del chat' });
  }
};
