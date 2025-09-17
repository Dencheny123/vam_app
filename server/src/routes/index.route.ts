import { Router, Request, Response } from 'express';
import formatResponse from '../utils/formatResponse.js';
import authRouter from './auth.route.js';
import recordingRouter from './recording.route.js';
import metaDataRouter from './metaData.route.js';
import serviceRouter from './service.route.js';
import contactsRouter from './contacts.routes.js';
import faqRouter from './FAQ.route.js';
import myWorkRouter from './myWork.route.js';
import goodappRouter from './goodApp.route.js';
import imageRouter from './image.route.js';
import analyticsRouter from './analytics.route.js';
import notificationRouter from './notification.route.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/recording', recordingRouter);
router.use('/metadata', metaDataRouter);
router.use('/service', serviceRouter);
router.use('/contacts', contactsRouter);
router.use('/faq', faqRouter);
router.use('/my-work', myWorkRouter);
router.use('/proxy', goodappRouter);
router.use('/images', imageRouter);
router.use('/analytics', analyticsRouter);
router.use('/notifications', notificationRouter);
router.use((req: Request, res: Response) => {
  res.status(404).json(formatResponse(404, 'Not found', req.body));
});

export default router;
