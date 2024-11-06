// getChatsByUser.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { db } from "../lib/db"; // Adjust the import path based on your project structure

// Environment variables
const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

// Main function to get chats by user
export const getChatsByUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;
    const { status, roomId, filterValue } = req.body;

    // Verify user token via external API
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({
        status: "error",
        message: "Token no válido. Usuario no autenticado.",
      });
      return;
    }

    // Decode token to get userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Create base filter for querying the database
    const filter: any = {
      participants: { has: userId },
      status: status || "approved", // Default status is 'approved' if not provided
    };

    // Add roomId filter if present
    if (roomId) {
      let roomIdsArray: string[] = [];
      if (Array.isArray(roomId)) {
        roomIdsArray = roomId;
      } else if (typeof roomId === "string") {
        roomIdsArray = roomId.split(",").map((id) => id.trim());
      }

      filter.roomId = { in: roomIdsArray };
    }

    // Add filterValue filter if present
    if (filterValue) {
      filter.roomDetails = {
        path: ["title"],
        string_contains: filterValue,
        string_mode: "insensitive",
      };
    }

    // Fetch chats from the database based on the filter
    const chats = await db.chat.findMany({
      where: filter,
      orderBy: { updatedAt: "desc" },
    });

    // If no chats found, return an empty array
    if (!chats.length) {
      res.status(200).json({
        status: "success",
        chats: [],
      });
      return;
    }

    // Process each chat to include participant details and last message
    const chatData = await Promise.all(
      chats.map(async (chat) => {
        // Get the last message of the chat
        const lastMessage = await db.message.findFirst({
          where: { chatId: chat.id },
          orderBy: { timestamp: "desc" },
        });

        // Get details of participants
        const participantsWithNames = await Promise.all(
          chat.participants.map(async (participantId: string) => {
            try {
              const response = await axios.post(
                "https://dev-mobile-auth-api.uniroom.app/api/users/user-info",
                {
                  userId: participantId,
                }
              );
              return {
                id: participantId,
                name: response.data.user.name,
                email: response.data.user.email,
                imageUrl: response.data.user.imageUrl,
              };
            } catch (error) {
              console.error(
                `Error al obtener los detalles del participante ${participantId}:`,
                error
              );
              return {
                id: participantId,
                name: "Nombre no disponible",
                email: "Email no disponible",
                imageUrl: null,
              };
            }
          })
        );

        return {
          ...chat,
          participants: participantsWithNames,
          participantDetails: participantsWithNames, // Include participant details for the client
          lastMessage: lastMessage?.content || null,
          lastMessageTime: lastMessage?.timestamp || chat.updatedAt,
        };
      })
    );

    // Send the processed chat data to the client
    res.status(200).json({ status: "success", chats: chatData });
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(200).json({
      status: "error",
      message: "Error al obtener los chats, revisa que el token sea válido",
    });
  }
};

export default getChatsByUser;
