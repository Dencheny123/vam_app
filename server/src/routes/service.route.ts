import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller.js';
import { upload } from '../services/Service.service.js';

const serviceRouter = Router();

serviceRouter.post('/', upload.single('images'), ServiceController.createService);
serviceRouter.get('/', ServiceController.getAllServices);
serviceRouter.get('/:id', ServiceController.getOneService);
serviceRouter.put('/:id', upload.single('images'), ServiceController.updateService);
serviceRouter.delete('/:id', ServiceController.deleteService);

export default serviceRouter;
