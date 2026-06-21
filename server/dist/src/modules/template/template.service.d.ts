import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';
export interface SampleDay {
    day: number;
    destination: string;
    description?: string;
}
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
            id: string;
            name: string;
            description: string | null;
            cover: string | null;
            estimatedDays: number;
            estimatedBudget: number | null;
            categories: string[];
            tags: string[];
            sampleDays: SampleDay[];
            isPublic: boolean;
        }[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
    detail(id: string): Promise<{
        id: string;
        name: string;
        description: string | null;
        cover: string | null;
        estimatedDays: number;
        estimatedBudget: number | null;
        categories: string[];
        tags: string[];
        sampleDays: SampleDay[];
        isPublic: boolean;
    }>;
    apply(id: string, userId: string, dto: ApplyTemplateDto): Promise<{
        tripId: string;
        title: string;
    }>;
    private format;
}
