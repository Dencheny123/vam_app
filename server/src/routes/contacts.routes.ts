import { Router } from 'express';
import { ContactsController } from '../controllers/Contacts.controller.js';

const contactsRouter = Router();

contactsRouter.post('/', async (req, res) => {
  await ContactsController.createContact(req, res);
});

contactsRouter.get('/', async (req, res) => {
  await ContactsController.getAllContacts(req, res);
});

contactsRouter.get('/:id', async (req, res) => {
  await ContactsController.getContactById(req, res);
});

contactsRouter.put('/:id', async (req, res) => {
  await ContactsController.updateContact(req, res);
});

contactsRouter.delete('/:id', async (req, res) => {
  await ContactsController.deleteContact(req, res);
});

export default contactsRouter;
