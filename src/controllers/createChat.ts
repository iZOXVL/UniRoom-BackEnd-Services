import { Request, Response } from 'express';
import { db } from '../lib/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;  

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { landlord, token, room } = req.body;

    // Verificación del token
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(401).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    // Decodificación del token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const guestId = decoded.userId;

    // Buscar chat existente
    const existingChat = await db.chat.findFirst({
      where: {
        AND: [
          { participants: { has: landlord.id } },
          { participants: { has: guestId } },
          { roomId: room.roomId }
        ],
      },
    });

    console.log('existingChat:', existingChat);

    // Si ya existe un chat para esa habitación
    if (existingChat) {
      res.status(400).json({ status: 'error', message: 'Ya existe una solicitud para esta habitación.' });
      return;
    }

    // Crear nuevo chat
    const newChat = await db.chat.create({
      data: {
        participants: [landlord.id, guestId],
        status: 'pending', 
        roomId: room.roomId,  
      },
    });

    res.status(200).json({ status: 'success', chat: newChat });
  } catch (error) {
    console.error('Error al crear el chat:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear el chat' });
  }
};
