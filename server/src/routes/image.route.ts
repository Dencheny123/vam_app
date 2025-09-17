// imageRouter.ts
import { Router } from 'express';
import { ImageController } from '../controllers/Image.controller.js';
import { upload } from '../services/upload.service.js';

const imageRouter = Router();

imageRouter.get('/', ImageController.getAllImages);
imageRouter.post('/upload', upload.single('images'), ImageController.uploadImage);
imageRouter.delete('/:filename', ImageController.deleteImage);

export default imageRouter;