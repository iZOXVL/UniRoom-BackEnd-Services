// getChatStatisticsWithDates.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import axios from "axios";
import { db } from "../../lib/db"; // Ajusta la ruta de importación según la estructura de tu proyecto

// Variables de entorno
const verifyTokenApi = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

// Función principal para obtener estadísticas de chats con fechas de creación
export const getChatStatisticsWithDates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    // Verificar el token del usuario mediante API externa
    const tokenResponse = await axios.post(verifyTokenApi, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(200).json({
        status: "error",
        message: "Token no válido. Usuario no autenticado.",
      });
      return;
    }

    // Decodificar el token para obtener userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Contar los chats con estado "approved" y "pending" y obtener fechas de creación
    const [approvedChats, pendingChats, firstApprovedChat, lastApprovedChat, firstPendingChat, lastPendingChat] = await Promise.all([
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "approved",
        },
      }),
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "pending",
        },
      }),
      db.chat.findFirst({
        where: {
          participants: { has: userId },
          status: "approved",
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      db.chat.findFirst({
        where: {
          participants: { has: userId },
          status: "approved",
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      db.chat.findFirst({
        where: {
          participants: { has: userId },
          status: "pending",
        },
        orderBy: { createdAt: "asc" },
        select: { createdAt: true },
      }),
      db.chat.findFirst({
        where: {
          participants: { has: userId },
          status: "pending",
        },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    // Enviar estadísticas al cliente con fechas de creación
    res.status(200).json({
      status: "success",
      data: {
        approvedChats: {
          count: approvedChats,
          firstCreatedAt: firstApprovedChat?.createdAt || null,
          lastCreatedAt: lastApprovedChat?.createdAt || null,
        },
        pendingChats: {
          count: pendingChats,
          firstCreatedAt: firstPendingChat?.createdAt || null,
          lastCreatedAt: lastPendingChat?.createdAt || null,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de los chats:", error);
    res.status(200).json({
      status: "error",
      message: "Error al obtener las estadísticas de los chats.",
    });
  }
};

export default getChatStatisticsWithDates;
