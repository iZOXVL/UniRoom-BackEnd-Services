import { Router } from 'express';
import { createChat } from '../controllers/createChat';
import { saveMessage } from '../controllers/saveMessage';
import { getChatsByUser } from '../controllers/chatsByUser';
import { getMessages } from '../controllers/getMessages';

const router = Router();

router.post('/create-chat', createChat);
router.get('/chats/:token', getChatsByUser);
router.get('/messages/:chatId', getMessages);
router.post('/save-message', saveMessage);

export default router;
