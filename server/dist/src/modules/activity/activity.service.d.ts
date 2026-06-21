import { PrismaService } from '@/prisma/prisma.service';
export declare class ActivityService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    add(tripId: string, userId: string, type: string, content: string, amount?: number, metadata?: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        tripId: string;
        userId: string;
        type: string;
        content: string;
        amount: number | null;
        metadata: string | null;
    }>;
    listByTrip(tripId: string, options: {
        type?: string;
        page: number;
        pageSize: number;
    }): Promise<{
        list: {
            amount: number | undefined;
            metadata: any;
            user: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            id: string;
            createdAt: Date;
            tripId: string;
            userId: string;
            type: string;
            content: string;
        }[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
}
