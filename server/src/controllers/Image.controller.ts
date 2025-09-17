// ImageController.ts
import { Request, Response } from 'express';
import formatResponse from '../utils/formatResponse.js';
import { getImageListWithUsage, deleteImage } from '../services/upload.service.js';

export class ImageController {
  static async getAllImages(req: Request, res: Response) {
    console.log('GET /api/images called');
    try {
      const images = await getImageListWithUsage();
      res.status(200).json(formatResponse(200, 'Images retrieved', images));
    } catch (error) {
      console.error('Error retrieving images:', error);
      res.status(500).json(formatResponse(500, 'Error retrieving images'));
    }
  }

  static async uploadImage(req: Request, res: Response): Promise<any> {
    console.log('POST /api/images/upload called', req.file);
    try {
      if (!req.file) {
        return res.status(400).json(formatResponse(400, 'No file uploaded'));
      }
      const images = await getImageListWithUsage();
      res.status(200).json(formatResponse(200, 'Images retrieved', images));
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json(formatResponse(500, 'Server error'));
    }
  }

  static async deleteImage(req: Request, res: Response): Promise<any> {
    console.log('DELETE /api/images/:filename called', req.params);
    try {
      const { filename } = req.params;
      if (!filename) {
        return res.status(400).json(formatResponse(400, 'Filename is required'));
      }
      const success = deleteImage(filename);
      if (success) {
        return res.status(200).json(formatResponse(200, 'Image deleted'));
      } else {
        return res.status(404).json(formatResponse(404, 'Image not found'));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json(formatResponse(500, 'Error deleting image'));
    }
  }
}
