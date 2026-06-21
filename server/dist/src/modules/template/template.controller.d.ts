import { TemplateService } from './template.service';
import { ApplyTemplateDto } from '@/modules/trip/dto/trip.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
    list(tag?: string, keyword?: string, page?: string, pageSize?: string): Promise<{
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
    apply(id: string, user: JwtPayload, dto: ApplyTemplateDto): Promise<{
        tripId: string;
        title: string;
    }>;
}
