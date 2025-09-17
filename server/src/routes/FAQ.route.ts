import { Router } from 'express';
import { FAQController } from '../controllers/FAQ.controller.js';

const faqRouter = Router();

faqRouter.post('/', async (req, res) => {
  await FAQController.createFAQ(req, res);
});

faqRouter.get('/', async (req, res) => {
  await FAQController.getAllFAQs(req, res);
});

faqRouter.get('/:id', async (req, res) => {
  await FAQController.getFAQById(req, res);
});

faqRouter.put('/:id', async (req, res) => {
  await FAQController.updateFAQ(req, res);
});

faqRouter.delete('/:id', async (req, res) => {
  await FAQController.deleteFAQ(req, res);
});

export default faqRouter;