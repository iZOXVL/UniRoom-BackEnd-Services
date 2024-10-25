import { Request, Response } from 'express';
import { db } from '../lib/db'; // Prisma client configurado
import { sendApprovalNotificationEmail } from '../lib/mail';

export const updateChatStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, status, email, title } = req.body;

    // Validar que el status sea 'approved'
    if (status !== 'approved') {
      res.status(400).json({ status: 'error', message: 'Status no válido. Solo se acepta "approved".' });
      return;
    }

    // Buscar el chat por ID
    const chat = await db.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      res.status(404).json({ status: 'error', message: 'Chat no encontrado.' });
      return;
    }

    // Actualizar el status del chat a 'approved'
    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: { status: 'approved' },
    });

    sendApprovalNotificationEmail(email, title);

    res.status(200).json({ status: 'success', message: 'La solicitud fue aprobada.', chat: updatedChat });
  } catch (error) {
    console.error('Error al actualizar el chat:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el chat.' });
  }
};
