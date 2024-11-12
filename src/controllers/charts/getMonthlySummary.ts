// statsController.ts
import { Request, Response } from "express";
import axios from "axios";
import { db } from "../../lib/db";
import {
  subMonths,
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
} from "date-fns";
import jwt from "jsonwebtoken";

const VERIFY_TOKEN_API = process.env.VERIFY_TOKEN_API as string;
const JWT_SECRET = process.env.JWT_SECRET as string;

export const getMonthlySummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = req.body.token;

    // Verify user token
    const tokenResponse = await axios.post(VERIFY_TOKEN_API, { token });
    if (!tokenResponse.data.validateToken) {
      res.status(401).json({
        status: "error",
        message: "Token no válido. Usuario no autenticado.",
      });
      return;
    }

    // Decode token to get userId
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Prepare last 12 months in correct order (from oldest to newest)
    const now = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      months.push({
        start: startOfMonth(date),
        end: endOfMonth(date),
        label: format(date, "MMM"),
        monthNumber: date.getMonth(), // 0-11
        year: date.getFullYear(),
        key: `${date.getFullYear()}-${date.getMonth() + 1}`, // Adjusted month number (1-12)
      });
    }

    // Initialize arrays for data
    const habitacionesPublicadasData: number[] = [];
    const solicitudesHabitacionesData: number[] = [];

    // Get rooms published data from external API
    const roomsResponse = await axios.post(
      "https://uruniroom.azurewebsites.net/api/Rooms/GetRoomsCreatedByDay",
      { token }
    );
    const roomsData = roomsResponse.data; // array of { creationDate, roomCount }

    // Aggregate rooms published per month
    const roomsPerMonth: { [key: string]: number } = {};
    roomsData.forEach((room: { creationDate: string; roomCount: number }) => {
      const date = parseISO(room.creationDate);
      const monthNumber = date.getMonth() + 1; // Adjust month number to 1-12
      const year = date.getFullYear();
      const key = `${year}-${monthNumber}`;
      roomsPerMonth[key] = (roomsPerMonth[key] || 0) + room.roomCount;
    });

    // Build habitacionesPublicadasData
    months.forEach((month) => {
      const count = roomsPerMonth[month.key] || 0;
      habitacionesPublicadasData.push(count);
    });

    // Get solicitudes de habitaciones data from your database (number of chats per month)
    for (const month of months) {
      const count = await db.chat.count({
        where: {
          participants: { has: userId },
          createdAt: {
            gte: month.start,
            lt: month.end,
          },
        },
      });
      solicitudesHabitacionesData.push(count);
    }

    // Prepare categories
    const categories = months.map((month) => month.label);

    // Return data
    res.status(200).json({
      status: "success",
      data: {
        categories,
        series: [
          {
            name: "Habitaciones Publicadas",
            data: habitacionesPublicadasData,
          },
          {
            name: "Solicitudes de Habitaciones",
            data: solicitudesHabitacionesData,
          },
        ],
      },
    });
  } catch (error) {
    console.error("Error al obtener los datos para el gráfico:", error);
    res.status(500).json({
      status: "error",
      message: "Error al obtener los datos para el gráfico.",
    });
  }
};
