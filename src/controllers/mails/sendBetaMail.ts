import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { sendBetaEmail } from '../../lib/mail';

export const sendBetaMail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;
    console.log('Datos del cliente:', name, email, phone);  

    // Guardar en la base de datos
    const newClient = await db.client.create({
      data: {
        name,
        email,
        phone,
      },
    });

    await sendBetaEmail(name, email);

    res.status(200).json({ status: 'success', client: newClient });
  } catch (error) {
    console.error('Error al guardar el cliente:', error);
    res.status(500).json({ status: 'error', message: 'Error al guardar el cliente' });
  }
};
