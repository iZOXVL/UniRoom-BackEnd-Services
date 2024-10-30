import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { db } from "../lib/db";

const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getRequestByUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      const { status, roomId } = req.body; // Agregar roomId al cuerpo de la solicitud

  
      // Verificar el token de usuario a través de la API
      const tokenResponse = await axios.post(verifyTokenApi, { token });
      if (!tokenResponse.data.validateToken) {
        res.status(200).json({ status: "error", message: "Token no válido. Usuario no autenticado." });
        return;
      }
  
      // Decodificar el token para obtener el userId
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const userId = decoded.userId;
  
      // Crear filtro base para la búsqueda
      const filter = {
        participants: { has: userId },
        status: status,
        ...(roomId && { roomId }) // Filtrar por roomId si está presente
      };
  
      const chats = await db.chat.findMany({
        where: filter,
        orderBy: { updatedAt: "desc" },
      });
  
      if (!chats.length) {
        res.status(200).json({ status: "error", message: "No se encontraron chats para este usuario." });
        return;
      }
  
      const chatData = await Promise.all(
        chats.map(async (chat) => {
          const lastMessage = await db.message.findFirst({
            where: { chatId: chat.id },
            orderBy: { timestamp: "desc" },
          });
  
          const participantsWithNames = await Promise.all(
            chat.participants.map(async (participantId: string) => {
              try {
                const response = await axios.post("https://dev-mobile-auth-api.uniroom.app/api/users/user-info", {
                  userId: participantId,
                });
                return {
                  id: participantId,
                  name: response.data.user.name,
                  email: response.data.user.email,
                };
              } catch (error) {
                console.error(`Error al obtener el nombre del participante ${participantId}:`, error);
                return {
                  id: participantId,
                  name: "Nombre no disponible",
                  email: "Email no disponible",
                };
              }
            })
          );
  
          return {
            ...chat,
            participants: participantsWithNames,
            lastMessage: lastMessage?.content || null,
            lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
          };
        })
      );
  
      res.status(200).json({ status: "success", chats: chatData });
    } catch (error) {
      console.error("Error al obtener los chats:", error);
      res.status(200).json({ status: "error", message: "Error al obtener los chats, revisa que el token sea valido" });
    }
  };
  
