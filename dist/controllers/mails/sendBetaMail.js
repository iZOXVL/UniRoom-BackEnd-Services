"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBetaMail = void 0;
const db_1 = require("../../lib/db");
const mail_1 = require("../../lib/mail");
const sendBetaMail = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        console.log('Datos del cliente:', name, email, phone);
        // Guardar en la base de datos
        const newClient = await db_1.db.client.create({
            data: {
                name,
                email,
                phone,
            },
        });
        await (0, mail_1.sendBetaEmail)(name, email);
        res.status(200).json({ status: 'success', client: newClient });
    }
    catch (error) {
        console.error('Error al guardar el cliente:', error);
        res.status(500).json({ status: 'error', message: 'Error al guardar el cliente' });
    }
};
exports.sendBetaMail = sendBetaMail;
