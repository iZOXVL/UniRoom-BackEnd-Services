import { Request, Response } from 'express';
import { db } from '../lib/db';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const verifyTokenApi = 'https://dev-mobile-auth-api.uniroom.app/api/users/verify-auth';
const getRoomDetailsApi = 'https://uruniroom.azurewebsites.net/api/Rooms/GetRoomDetails';
const JWT_SECRET = process.env.JWT_SECRET as string;

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, room } = req.body;

    console.log('Token:', token, 'Room:', room);  

    // Verificación del token
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    const guest = tokenResponse.data.user;

    console.log('Guest:', guest);

    // Obtener detalles de la habitación y landlord
    const roomDetailsResponse = await axios.post(getRoomDetailsApi, { roomId: room.roomId });
    const roomDetails = roomDetailsResponse.data;
    const landlord = roomDetails.landlordDto;

    console.log('Landlord:', roomDetailsResponse);

    // Buscar chat existente
    const existingChat = await db.chat.findFirst({
      where: {
        AND: [
          { participants: { has: landlord.id } },
          { participants: { has: guest.id } },
          { roomId: room.roomId },
        ],
      },
    });

    if (existingChat) {
      res.status(200).json({ status: 'error', message: 'Ya existe una solicitud para esta habitación.' });
      return;
    }

    // Crear nuevo chat con detalles de landlord y guest
    const newChat = await db.chat.create({
      data: {
        participants: [landlord.id, guest.id], // Solo los IDs para la validación
        participantDetails: [
          {
            userType: 'userLandlord',
            id: "cm2a1xuzc00009alqzu5iui0s",
            name: landlord.name,
            imageUrl: landlord.imageUrl,
          },
          {
            userType: 'userGuest',
            id: guest.id,
            name: guest.name,
            imageUrl: guest.image || null,
          }
        ],
        status: 'pending',
        roomId: room.roomId,
        roomDetails: {
          title: roomDetails.title || 'Sin título',
          description: roomDetails.description || 'Sin descripción',
          price: roomDetails.price || 0,
          location: roomDetails.location || 'Ubicación no especificada',
        },
      },
    });
    

    res.status(200).json({ status: 'success', chat: newChat });
  } catch (error) {
    console.error('Error al crear el chat:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear el chat' });
  }
};
