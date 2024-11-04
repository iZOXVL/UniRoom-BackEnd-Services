import { Request, Response } from 'express';
import { db } from '../lib/db'; // Prisma client configurado

export const updateUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, newName } = req.body;

    // Verificar que el usuario existe
    const user = await db.client.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado.' });
      return;
    }

    // Actualizar el nombre del usuario en la colección de chats
    const updatedChats = await db.chat.updateMany({
      where: {
        participants: {
          has: userId, // Verifica que el usuario es un participante del chat
        },
      },
      data: {
        participantDetails: {
          set: { name: newName }, // Cambia el nombre en participantDetails
        },
      },
    });

    // Actualizar el nombre del usuario en la colección de mensajes
    const updatedMessages = await db.message.updateMany({
      where: {
        senderId: userId,
      },
      data: {
        nickname: newName,
      },
    });

    res.status(200).json({
      status: 'success',
      message: `Nombre del usuario actualizado a "${newName}" en ${updatedChats.count} chats y ${updatedMessages.count} mensajes.`,
    });
  } catch (error) {
    console.error('Error al actualizar el nombre del usuario en chats y mensajes:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el nombre del usuario en chats y mensajes.' });
  }
};
