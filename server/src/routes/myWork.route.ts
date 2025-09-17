import { Router } from 'express';
import { MyWorkController } from '../controllers/MyWork.controller.js';
import { uploads } from '../services/MyWork.service.js';

const myWorkRouter = Router();

myWorkRouter.post('/', uploads.array('images', 20), MyWorkController.createMyWork);
myWorkRouter.get('/', MyWorkController.getAllMyWorks);
myWorkRouter.get('/:id', MyWorkController.getMyWorkById);
myWorkRouter.put('/:id', uploads.array('images', 20), MyWorkController.updateMyWork);
myWorkRouter.delete('/:id', MyWorkController.deleteMyWork);

export default myWorkRouter;