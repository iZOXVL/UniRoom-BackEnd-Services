"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const client_1 = require("@prisma/client");
// Crear una nueva instancia de Prisma o usar la global existente
exports.db = globalThis.prisma || new client_1.PrismaClient();
// Si no estamos en producción, mantener una instancia global para hot-reloading en desarrollo
if (process.env.NODE_ENV !== "production")
    globalThis.prisma = exports.db;
