import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
    list(_tripId: string, type?: string, page?: string, pageSize?: string): Promise<{
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
