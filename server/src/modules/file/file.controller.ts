import {
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Request } from 'express';
import { FileService } from './file.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

const storage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, join(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    cb(null, unique);
  },
});

@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly configService: ConfigService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage }))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    this.fileService.validate(file);
    const url = this.fileService.buildUrl(file, req);
    return {
      url,
      size: file.size,
      type: file.mimetype,
      name: file.originalname,
    };
  }

  @Get('oss-credentials')
  @UseGuards(JwtAuthGuard)
  async ossCredentials() {
    return this.fileService.ossCredentials();
  }
}
