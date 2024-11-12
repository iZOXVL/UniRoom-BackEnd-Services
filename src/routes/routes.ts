import { Router } from 'express';
import { createChat } from '../controllers/createChat';
import { getChatsByUser } from '../controllers/chatsByUser';
import { getMessages } from '../controllers/getMessages';
import { updateChatStatus } from '../controllers/updateChatStatus';
import { getRequestByUser } from '../controllers/requestByUser';
import { sendBetaMail } from '../controllers/mails/sendBetaMail';
import { updateUserInfo } from '../controllers/updateUserInfo';
import getChatsSuccess from '../controllers/chatsSucces';
import { serviceAlive } from '../controllers/status/serviceAlive';
import { getDashboardStats } from '../controllers/charts/getChatCharts';
import { getWeeklySummary } from '../controllers/charts/getWeeklySummary';
import { getMonthlySummary } from '../controllers/charts/getMonthlySummary';

const router = Router();

router.post('/create-chat', createChat);
router.get('/chats/:token', getChatsByUser);
router.post('/chats/:token', getChatsSuccess);
router.get('/messages/:chatId', getMessages);
router.post('/update-status', updateChatStatus);
router.post('/update-user', updateUserInfo);
router.post('/chats-request/:token', getRequestByUser);
router.post('/mails/email-beta', sendBetaMail);
router.get('/mobile/status/service-alive', serviceAlive);
router.post('/web/dashboard/stats', getDashboardStats);
router.post('/web/dashboard/week-summary', getWeeklySummary);
router.post('/web/dashboard/month-summary', getMonthlySummary);

export default router;
