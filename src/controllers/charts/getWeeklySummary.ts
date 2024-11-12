// weeklySummaryController.ts
import { Request, Response } from "express";
import axios from "axios";
import { db } from "../../lib/db";
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from "date-fns";
import jwt from "jsonwebtoken";

const VERIFY_TOKEN_API = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getWeeklySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.body.token;

    // Verificar el token de usuario
    const tokenResponse = await axios.post(VERIFY_TOKEN_API, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(401).json({
        status: "error",
        message: "Token no válido. Usuario no autenticado.",
      });
      return;
    }

    // Decodificar el token para obtener el userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    const now = new Date();
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 }); // Semana inicia el lunes
    const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });

    // Crear un array con las fechas de cada día de la semana actual
    const daysOfWeek = eachDayOfInterval({ start: startOfCurrentWeek, end: endOfCurrentWeek });

    // Inicializar contadores diarios
    const weeklyData = {
      requests: Array(7).fill(0), // Para solicitudes recibidas
      reservations: Array(7).fill(0), // Para habitaciones reservadas
    };

    // Consultar chats para solicitudes recibidas y habitaciones reservadas en la semana actual
    const chats = await db.chat.findMany({
      where: {
        participants: { has: userId },
        createdAt: {
          gte: startOfCurrentWeek,
          lt: endOfCurrentWeek,
        },
      },
    });

    // Contar las solicitudes y reservas por día
    chats.forEach((chat) => {
      const dayIndex = daysOfWeek.findIndex(
        (day) => format(day, "yyyy-MM-dd") === format(chat.createdAt, "yyyy-MM-dd")
      );

      if (dayIndex !== -1) {
        weeklyData.requests[dayIndex] += 1; // Contar como solicitud recibida
        if (chat.status === "approved") {
          weeklyData.reservations[dayIndex] += 1; // Contar como reserva si está aprobada
        }
      }
    });

    // Formatear la respuesta para el frontend
    res.status(200).json({
      status: "success",
      data: {
        days: ["L", "M", "Mi", "J", "V", "S", "D"],
        requests: weeklyData.requests,
        reservations: weeklyData.reservations,
      },
    });
  } catch (error) {
    console.error("Error al obtener el resumen semanal:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener el resumen semanal.",
    });
  }
};
