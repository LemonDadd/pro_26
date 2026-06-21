import { Request } from 'express';
import { FileService } from './file.service';
import { ConfigService } from '@nestjs/config';
export declare class FileController {
    private readonly fileService;
    private readonly configService;
    constructor(fileService: FileService, configService: ConfigService);
    upload(file: Express.Multer.File, req: Request): Promise<{
        url: string;
        size: number;
        type: string;
        name: string;
    }>;
    ossCredentials(): Promise<{
        provider: string;
        message: string;
        uploadEndpoint: string;
        maxSize: number;
        allowedTypes: string[];
    }>;
}
