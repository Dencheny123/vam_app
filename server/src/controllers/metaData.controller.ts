import { Request, Response } from 'express';
import { MetaDataService } from '../services/MetaData.service.js';
import formatResponse from '../utils/formatResponse.js';

export class MetaDataController {
  static async getAllMetaData(req: Request, res: Response) {
    try {
      const metaData = await MetaDataService.getAllMetaData();
      return res.status(200).json(formatResponse(200, 'Метаданные готовы', metaData));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(formatResponse(500, 'Сервер не ответил в getAllMetaData'));
    }
  }

  static async getOneMetaData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json(formatResponse(400, 'Нет id'));
      }
      if (isNaN(Number(id))) {
        return res.status(400).json(formatResponse(400, 'id не число'));
      }
      const metaData = await MetaDataService.getOneMetaData(Number(id));
      return res.status(200).json(formatResponse(200, 'Метаданные готовы', metaData));
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json(formatResponse(500, 'Сервер не ответил в getOneMetaData'));
    }
  }

  static async updateMetaData(req: Request, res: Response) {
    try {
      const { id, ...updateData } = req.body;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID метаданных обязателен для обновления',
        });
      }
      const parsedId = Number(id);
      if (isNaN(parsedId)) {
        return res.status(400).json({
          success: false,
          message: 'ID должен быть числом',
        });
      }
      const existingMeta = await MetaDataService.getOneMetaData(parsedId);
      if (!existingMeta) {
        return res.status(404).json({
          success: false,
          message: 'Метаданные с указанным ID не найдены',
        });
      }

      // Явная типизация req.files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // Обрабатываем иконки, если они были загружены
      let processedIconsIcon = existingMeta.icons_icon;
      let processedIconsShortcut = existingMeta.icons_shortcut;
      let processedIconsApple = existingMeta.icons_apple;

      if (files?.['icons_icon']?.[0]) {
        try {
          console.log('Processing icons_icon file:', files['icons_icon'][0].filename);
          processedIconsIcon = await MetaDataService.processIcons(files['icons_icon'][0]);
          console.log('Processed icons_icon:', processedIconsIcon);
        } catch (error) {
          console.error('Error processing icons_icon:', error);
          return res.status(500).json(formatResponse(500, 'Ошибка обработки иконки', null, error instanceof Error ? error.message : 'Unknown error'));
        }
      }

      if (files?.['icons_shortcut']?.[0]) {
        try {
          console.log('Processing icons_shortcut file:', files['icons_shortcut'][0].filename);
          processedIconsShortcut = await MetaDataService.processShortcut(files['icons_shortcut'][0]);
          console.log('Processed icons_shortcut:', processedIconsShortcut);
        } catch (error) {
          console.error('Error processing icons_shortcut:', error);
          return res.status(500).json(formatResponse(500, 'Ошибка обработки shortcut иконки', null, error instanceof Error ? error.message : 'Unknown error'));
        }
      }

      if (files?.['icons_apple']?.[0]) {
        try {
          console.log('Processing icons_apple file:', files['icons_apple'][0].filename);
          processedIconsApple = await MetaDataService.processApple(files['icons_apple'][0]);
          console.log('Processed icons_apple:', processedIconsApple);
        } catch (error) {
          console.error('Error processing icons_apple:', error);
          return res.status(500).json(formatResponse(500, 'Ошибка обработки apple иконки', null, error instanceof Error ? error.message : 'Unknown error'));
        }
      }

      const dataImg = {
        ...updateData,
        icons_icon: processedIconsIcon,
        icons_shortcut: processedIconsShortcut,
        icons_apple: processedIconsApple,
      };

      const updatedMeta = await MetaDataService.updateMetaData(parsedId, dataImg);
      // Получаем обновленные данные в правильном формате (с распарсенными массивами)
      const formattedMeta = await MetaDataService.getOneMetaData(parsedId);
      
      return res.status(201).json(formatResponse(201, 'Данные обновлены', formattedMeta));
    } catch (error) {
      console.error('Error in updateMetaData:', error);
      return res.status(500).json(formatResponse(500, 'Ошибка сервера при обновлении метаданных', null, error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}