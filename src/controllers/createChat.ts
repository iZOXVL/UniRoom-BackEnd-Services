import { Request, Response } from 'express';
import { db } from '../lib/db';
import axios from 'axios';
import { sendLandlordNotificationEmail } from '../lib/mail';

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const getRoomDetailsApi = 'https://uruniroom.azurewebsites.net/api/Rooms/GetRoomDetails';
const getUserInfoApi = 'https://dev-mobile-auth-api.uniroom.app/api/users/user-info';

// Función para obtener el nombre del usuario desde la API
const fetchUserName = async (userId: string) => {
  try {
    const response = await axios.post(getUserInfoApi, { userId });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener el nombre del usuario ${userId}:`, error);
    return null;
  }
};

export const createChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, room } = req.body;

    // Verificación del token
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({ status: 'error', message: 'Token no válido. Usuario no autenticado.' });
      return;
    }

    const guest = tokenResponse.data.user;

    // Obtener detalles de la habitación y landlord
    const roomDetailsResponse = await axios.post(getRoomDetailsApi, { roomId: room.roomId });
    const roomDetails = roomDetailsResponse.data;
    const landlord = roomDetails.landlordDto;

    // Obtener el nombre de cada participante usando su ID
    const landlordInfo = await fetchUserName(landlord.id);
    const guestInfo = await fetchUserName(guest.id);

    console.log('Creando chat:', landlordInfo.user.name, guestInfo.user.email, roomDetails.title);

    // Extraer la primera imagen del array multimediaDto.imageUrl
    const roomImageUrl = roomDetails.multimediaDto?.imageUrl?.[0] || null;

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

    // Crear nuevo chat con detalles de landlord, guest y primera imagen de la habitación
    const newChat = await db.chat.create({
      data: {
        participants: [landlord.id, guest.id], // Solo los IDs para la validación
        participantDetails: [
          {
            userType: 'userLandlord',
            id: landlord.id,
            name: landlordInfo.user.name || landlord.name,
            imageUrl: landlord.imageUrl,
          },
          {
            userType: 'userGuest',
            id: guest.id,
            name: guestInfo.user.name || guest.name,
            imageUrl: guest.image || null,
          }
        ],
        status: 'pending',
        roomId: room.roomId,
        roomDetails: {
          title: roomDetails.title || 'Sin título',
          imageUrl: roomImageUrl, // Guardar la primera imagen aquí
          description: roomDetails.description || 'Sin descripción',
          price: roomDetails.price || 0,
          location: roomDetails.address || 'Ubicación no especificada',
        },
      },
    });
    console.log('Nuevo chat creado:', landlordInfo.user.email, guestInfo.user.email, roomDetails.title);

    sendLandlordNotificationEmail(landlordInfo.user.email, roomDetails.title);
    

    res.status(200).json({ status: 'success', chat: newChat });
  } catch (error) {
    console.error('Error al crear el chat:', error);
    res.status(200).json({ status: 'error', message: 'Error al crear el chat' });
  }
};
