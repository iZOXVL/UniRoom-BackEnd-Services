import { Request, Response } from 'express';
import { db } from '../lib/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;  

export const getChatsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const chats = await db.chat.findMany({
      where: {
        participants: { has: userId },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!chats.length) {
      res.status(404).json({ status: 'error', message: 'No se encontraron chats para este usuario.' });
      return;
    }

    const chatData = await Promise.all(chats.map(async (chat) => {
      const lastMessage = await db.message.findFirst({
        where: { chatId: chat.id },
        orderBy: { timestamp: 'desc' },
      });
      return { ...chat, lastMessage: lastMessage?.content || null, lastMessageTime: lastMessage?.timestamp || chat.updatedAt };
    }));

    res.status(200).json({ status: 'success', chats: chatData });
  } catch (error) {
    console.error('Error al obtener los chats:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los chats' });
  }
};