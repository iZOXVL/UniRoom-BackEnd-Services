import { PrismaClient } from "@prisma/client";

// Declaración global para evitar múltiples instancias de Prisma en desarrollo
declare global {
  var prisma: PrismaClient | undefined;
}

// Crear una nueva instancia de Prisma o usar la global existente
export const db = globalThis.prisma || new PrismaClient();

// Si no estamos en producción, mantener una instancia global para hot-reloading en desarrollo
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
