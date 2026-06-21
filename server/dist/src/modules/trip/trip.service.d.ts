import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';
export declare class TripService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    create(userId: string, dto: CreateTripDto): Promise<{
        id: any;
        title: any;
        destination: any;
        startDate: any;
        endDate: any;
        leaderId: any;
        status: any;
        templateId: any;
        inviteCode: any;
        createdAt: any;
        updatedAt: any;
        leader: any;
        members: any;
        days: any;
        stats: {
            totalExpense: number;
            expenseCount: any;
            memberCount: any;
        };
    }>;
    private uniqueInviteCode;
    list(userId: string, status?: string, page?: number, pageSize?: number): Promise<{
        list: any[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
    detail(id: string): Promise<{
        id: any;
        title: any;
        destination: any;
        startDate: any;
        endDate: any;
        leaderId: any;
        status: any;
        templateId: any;
        inviteCode: any;
        createdAt: any;
        updatedAt: any;
        leader: any;
        members: any;
        days: any;
        stats: {
            totalExpense: number;
            expenseCount: any;
            memberCount: any;
        };
    }>;
    update(id: string, dto: UpdateTripDto): Promise<{
        id: any;
        title: any;
        destination: any;
        startDate: any;
        endDate: any;
        leaderId: any;
        status: any;
        templateId: any;
        inviteCode: any;
        createdAt: any;
        updatedAt: any;
        leader: any;
        members: any;
        days: any;
        stats: {
            totalExpense: number;
            expenseCount: any;
            memberCount: any;
        };
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    complete(id: string): Promise<{
        id: string;
        status: string;
    }>;
    summary(tripId: string): Promise<{
        totalExpense: number;
        avgPerPerson: number;
        expenseCount: number;
        memberCount: number;
        categoryStats: import("@/utils/aa-calculator").CategoryStat[];
    }>;
    private detailInclude;
    private stripRelations;
    private formatTrip;
}
