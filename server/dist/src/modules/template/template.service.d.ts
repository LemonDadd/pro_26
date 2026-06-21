import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';
export declare class TemplateService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    list(query: {
        tag?: string;
        keyword?: string;
        page: number;
        pageSize: number;
    }): Promise<{
        list: {
            id: any;
            name: any;
            description: any;
            cover: any;
            estimatedDays: any;
            estimatedBudget: any;
            categories: any;
            tags: any;
            sampleDays: any;
            isPublic: any;
        }[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
    detail(id: string): Promise<{
        id: any;
        name: any;
        description: any;
        cover: any;
        estimatedDays: any;
        estimatedBudget: any;
        categories: any;
        tags: any;
        sampleDays: any;
        isPublic: any;
    }>;
    apply(id: string, userId: string, dto: ApplyTemplateDto): Promise<{
        tripId: string;
        title: string;
    }>;
    private format;
}
