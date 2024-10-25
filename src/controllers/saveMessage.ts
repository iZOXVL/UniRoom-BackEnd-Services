import { Request, Response } from 'express';
import { db } from '../lib/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;
const userInfoApi = 'https://dev-mobile-auth-api.uniroom.app/api/users/user-info';

export const saveMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, content, token } = req.body;

    // Verificación del token
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    // Decodificar token para obtener el senderId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const senderId = decoded.userId;

    // Llamada a la API para obtener el nombre del usuario
    const userInfoResponse = await axios.post(userInfoApi, { userId: senderId });

    if (!userInfoResponse.data.success) {
      res.status(200).json({ status: 'error', message: 'No se pudo recuperar la información del usuario.' });
      return;
    }

    const senderName = userInfoResponse.data.user.name;

    // Crear el nuevo mensaje usando el nombre recuperado
    const newMessage = await db.message.create({
      data: {
        chatId,
        senderId,
        nickname: senderName,
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
