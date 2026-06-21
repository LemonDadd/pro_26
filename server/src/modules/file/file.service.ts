import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}

  private readonly allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];
  private readonly maxSize = 10 * 1024 * 1024;

  validate(file: Express.Multer.File) {
    if (!file) throwBiz(ErrorCodes.FILE_UPLOAD_FAILED, '文件不存在');
    if (!this.allowedTypes.includes(file.mimetype)) {
      throwBiz(ErrorCodes.FILE_TYPE_UNSUPPORTED);
    }
    if (file.size > this.maxSize) {
      throwBiz(ErrorCodes.FILE_TOO_LARGE);
    }
  }

  buildUrl(file: Express.Multer.File, req: Request): string {
    const port = this.configService.get<number>('PORT', 3000);
    const host = req?.headers?.host || `localhost:${port}`;
    return `http://${host}/uploads/${file.filename}`;
  }

  ossCredentials() {
    return {
      provider: 'mock',
      message: '本地开发环境使用本地文件上传，无需 OSS 凭证',
      uploadEndpoint: '/api/v1/files/upload',
      maxSize: this.maxSize,
      allowedTypes: this.allowedTypes,
    };
  }
}
