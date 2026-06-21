import { PrismaService } from '@/prisma/prisma.service';
export declare class UserService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }>;
    findByIds(ids: string[]): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }[]>;
}
