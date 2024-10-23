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

    // Decodificar token (opcional si no necesitas otros detalles)
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const senderId = decoded.userId;

    // Crear el nuevo mensaje, usando el nombre del usuario extraído del token en lugar de pasarlo desde el cuerpo de la petición
    const newMessage = await db.message.create({
      data: {
        chatId,
        senderId,
        nickname: guest.name,
        content,
        isRead: false,
      },
    });

    res.status(200).json({ status: 'success', message: newMessage });
  } catch (error) {
    console.error('Error al guardar el mensaje:', error);
    res.status(200).json({ status: 'error', message: 'Error al guardar el mensaje' });
  }
};
