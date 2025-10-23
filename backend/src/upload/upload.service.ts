import { Injectable } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  getMulterConfig(): MulterOptions {
    return {
      storage: diskStorage({
        destination: process.env.UPLOAD_PATH || './uploads',
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
      },
    };
  }

  getFileUrl(filename: string): string {
    return `${process.env.APP_URL || 'http://localhost:3001'}/uploads/${filename}`;
  }
}
