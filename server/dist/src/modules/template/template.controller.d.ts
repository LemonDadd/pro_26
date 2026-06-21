import { TemplateService } from './template.service';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
    list(tag?: string, keyword?: string, page?: string, pageSize?: string): Promise<{
        list: {
            id: string;
            name: string;
            description: string | null;
            cover: string | null;
            estimatedDays: number;
            estimatedBudget: number | null;
            categories: string[];
            tags: string[];
            sampleDays: import("./template.service").SampleDay[];
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
        sampleDays: import("./template.service").SampleDay[];
        isPublic: boolean;
    }>;
    apply(id: string, user: JwtPayload, dto: ApplyTemplateDto): Promise<{
        tripId: string;
        title: string;
    }>;
}
