import { Request, Response } from 'express';
import { db } from '../lib/db'; // Prisma client configurado
import { sendApprovalNotificationEmail, sendRefusedNotificationEmail } from '../lib/mail';

export const updateChatStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, status, email, title } = req.body;

    // Validar que el status sea 'approved' o 'refused'
    if (status !== 'approved' && status !== 'refused') {
      res.status(400).json({ status: 'error', message: 'Status no válido. Solo se acepta "approved" o "refused".' });
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

    // Actualizar el status del chat al valor recibido en el body
    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: { status },
    });

    // Enviar notificación solo si el status es 'approved'
    if (status === 'approved') {
      sendApprovalNotificationEmail(email, title);
    }

    if (status === 'refused') {
      sendRefusedNotificationEmail(email, title);
    }

    res.status(200).json({ status: 'success', message: `La solicitud fue ${status}.`, chat: updatedChat });
  } catch (error) {
    console.error('Error al actualizar el chat:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el chat.' });
  }
};
