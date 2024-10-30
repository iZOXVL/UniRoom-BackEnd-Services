import { Router } from 'express';
import { createChat } from '../controllers/createChat';
import { getChatsByUser } from '../controllers/chatsByUser';
import { getMessages } from '../controllers/getMessages';
import { updateChatStatus } from '../controllers/updateChatStatus';
import { getRequestByUser } from '../controllers/requestByUser';

const router = Router();

router.post('/create-chat', createChat);
router.get('/chats/:token', getChatsByUser);
router.get('/messages/:chatId', getMessages);
router.post('/update-status', updateChatStatus);
router.post('/chats-request', getRequestByUser);

export default router;
