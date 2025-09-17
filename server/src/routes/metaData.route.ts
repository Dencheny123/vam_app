import { Router } from 'express';
import { MetaDataController } from '../controllers/metaData.controller.js';
import { uploads } from '../services/MetaData.service.js';

const metaDataRouter = Router();

metaDataRouter.get('/', async (req, res) => {
  await MetaDataController.getAllMetaData(req, res);
});

metaDataRouter.get('/:id', async (req, res) => {
  await MetaDataController.getOneMetaData(req, res);
});

metaDataRouter.put(
  '/:id',
  uploads.fields([
    { name: 'icons_icon', maxCount: 1 },
    { name: 'icons_shortcut', maxCount: 1 },
    { name: 'icons_apple', maxCount: 1 },
  ]),
  async (req, res) => {
    await MetaDataController.updateMetaData(req, res);
  },
);

export default metaDataRouter;