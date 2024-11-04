import { Request, Response } from 'express';
import { db } from '../lib/db'; // Prisma client configurado

export const updateUserInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, newName } = req.body;

    // Verificar si existe al menos un chat o mensaje con ese userId
    const chatExists = await db.chat.findFirst({
      where: {
        participants: {
          has: userId,
        },
      },
    });

    const messageExists = await db.message.findFirst({
      where: {
        senderId: userId,
      },
    });

    // Si no existe ni en chats ni en mensajes, devolver error
    if (!chatExists && !messageExists) {
      res.status(404).json({ status: 'error', message: 'Usuario no encontrado en chats o mensajes.' });
      return;
    }

    // Actualizar el nombre del usuario en `participantDetails` dentro de los chats donde el usuario es participante
    const chats = await db.chat.findMany({
      where: {
        participants: {
          has: userId,
        },
      },
    });

    for (const chat of chats) {
        const updatedParticipantDetails = Array.isArray(chat.participantDetails)
          ? chat.participantDetails.map((participant: any) =>
              participant.id === userId ? { ...participant, name: newName } : participant
            )
          : [];
        await db.chat.update({
          where: { id: chat.id },
          data: {
            participantDetails: updatedParticipantDetails,
          },
        });
      }

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
      message: `Nombre del usuario actualizado a "${newName}" en ${chats.length} chats y ${updatedMessages.count} mensajes.`,
    });
  } catch (error) {
    console.error('Error al actualizar el nombre del usuario en chats y mensajes:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el nombre del usuario en chats y mensajes.' });
  }
};
