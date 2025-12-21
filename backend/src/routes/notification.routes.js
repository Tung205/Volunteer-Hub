
import express from 'express';
import { sendBroadcastNotification } from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/broadcast', sendBroadcastNotification);

export default router;
