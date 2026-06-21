import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
export declare class FileService {
    private readonly configService;
    constructor(configService: ConfigService);
    private readonly allowedTypes;
    private readonly maxSize;
    validate(file: Express.Multer.File): void;
    buildUrl(file: Express.Multer.File, req: Request): string;
    ossCredentials(): {
        provider: string;
        message: string;
        uploadEndpoint: string;
        maxSize: number;
        allowedTypes: string[];
    };
}
