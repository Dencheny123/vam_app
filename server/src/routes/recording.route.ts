import { Router } from 'express';
import { RecordingController } from '../controllers/Recording.controller.js';

const recordingRouter = Router();

recordingRouter.post('/', async (req, res) => {
  RecordingController.sendMessage(req, res);
});

recordingRouter.get('/orders', async (req, res) => {
  RecordingController.getOrders(req, res);
});

recordingRouter.get('/orders/:id', async (req, res) => {
  RecordingController.getOrder(req, res);
});

recordingRouter.put('/orders/:id', async (req, res) => {
  RecordingController.updateOrder(req, res);
});

recordingRouter.delete('/orders/:id', async (req, res) => {
  RecordingController.deleteOrder(req, res);
});

recordingRouter.post('/orders', async (req, res) => {
  RecordingController.createOrder(req, res);
});

recordingRouter.patch('/orders/bulk/status', async (req, res) => {
  RecordingController.updateOrdersStatus(req, res);
});

recordingRouter.post('/orders/bulk/delete', async (req, res) => {
  RecordingController.deleteOrders(req, res);
});

export default recordingRouter;
