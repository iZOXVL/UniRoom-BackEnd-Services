import { Router } from 'express';
import { createChat } from '../controllers/createChat';
import { getChatsByUser } from '../controllers/chatsByUser';
import { getMessages } from '../controllers/getMessages';
import { updateChatStatus } from '../controllers/updateChatStatus';
import { getRequestByUser } from '../controllers/requestByUser';
import { sendBetaMail } from '../controllers/mails/sendBetaMail';
import { updateUserInfo } from '../controllers/updateUserInfo';
import getChatStatistics from '../controllers/charts/getChatCharts';
import getChatsSuccess from '../controllers/chatsSucces';
import { serviceAlive } from '../controllers/status/serviceAlive';

const router = Router();

router.post('/create-chat', createChat);
router.get('/chats/:token', getChatsByUser);
router.post('/chats/:token', getChatsSuccess);
router.get('/messages/:chatId', getMessages);
router.post('/update-status', updateChatStatus);
router.post('/update-user', updateUserInfo);
router.post('/chats-request/:token', getRequestByUser);
router.post('/mails/email-beta', sendBetaMail);
router.post('/charts/chats-chart/:token', getChatStatistics);
router.get('/mobile/status/service-alive', serviceAlive);

export default router;
