// statsController.ts
import { Request, Response } from "express";
import axios from "axios";
import { db } from "../../lib/db";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";
import jwt from "jsonwebtoken";

const VERIFY_TOKEN_API = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
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
    const startOfCurrentMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    // Obtener total de visitas de la API externa
    const visitResponse = await axios.post("https://uruniroom.azurewebsites.net/api/Visit/GetVisits", { token });
    const totalVisits = visitResponse.data.totalVisits || 0;

    // Obtener las métricas del mes actual
    const [currentSolicitudes, currentChats, currentRefused] = await Promise.all([
      db.chat.count({
        where: {
          participants: { has: userId },
          createdAt: { gte: startOfCurrentMonth },
        },
      }),
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "approved",
          createdAt: { gte: startOfCurrentMonth },
        },
      }),
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "refused",
          createdAt: { gte: startOfCurrentMonth },
        },
      }),
    ]);

    // Obtener las métricas del mes anterior
    const [lastMonthSolicitudes, lastMonthChats, lastMonthRefused] = await Promise.all([
      db.chat.count({
        where: {
          participants: { has: userId },
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "approved",
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
      db.chat.count({
        where: {
          participants: { has: userId },
          status: "refused",
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
    ]);
    console.log("currentSolicitudes", lastMonthChats);

    // Cálculo de incremento porcentual
    const calculatePercentageIncrease = (current: number, previous: number) => {
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    };

    const percentageIncreaseSolicitudes = calculatePercentageIncrease(currentSolicitudes, lastMonthSolicitudes);
    const percentageIncreaseChats = calculatePercentageIncrease(currentChats, lastMonthChats);
    const percentageIncreaseRefused = calculatePercentageIncrease(currentRefused, lastMonthRefused);
    const percentageIncreaseVisits = calculatePercentageIncrease(totalVisits, 200); // Ejemplo de valor base para visitas

    // Responder con los datos organizados para el componente CardDataStats
    res.status(200).json({
      status: "success",
      data: {
        visitas: {
          title: "Vistas",
          total: totalVisits,
          rate: `${percentageIncreaseVisits.toFixed(2)}%`,
          levelUp: percentageIncreaseVisits >= 0,
        },
        solicitudes: {
          title: "Solicitudes",
          total: currentSolicitudes,
          rate: `${percentageIncreaseSolicitudes.toFixed(2)}%`,
          levelUp: percentageIncreaseSolicitudes >= 0,
        },
        chats: {
          title: "Chats",
          total: currentChats,
          rate: `${percentageIncreaseChats.toFixed(2)}%`,
          levelUp: percentageIncreaseChats >= 0,
        },
        rechazados: {
          title: "Rechazados",
          total: currentRefused,
          rate: `${percentageIncreaseRefused.toFixed(2)}%`,
          levelUp: percentageIncreaseRefused >= 0,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener las estadísticas:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener las estadísticas.",
    });
  }
};
