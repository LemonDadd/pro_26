import { TripDayPlan } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';
type UserRef = {
    id: string;
    nickname: string;
    avatar: string | null;
};
export declare class TripService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    create(userId: string, dto: CreateTripDto): Promise<{
        id: string;
        title: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        leaderId: string;
        status: string;
        templateId: string | null;
        inviteCode: string;
        createdAt: Date;
        updatedAt: Date;
        leader: UserRef;
        members: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: string;
            joinedAt: Date;
        }[];
        days: {
            id: string;
            day: number;
            date: Date | null;
            destination: string;
            description: string | null;
        }[];
        stats: {
            totalExpense: number;
            avgPerPerson: number;
            expenseCount: number;
            memberCount: number;
        };
    }>;
    list(userId: string, status?: string, page?: number, pageSize?: number): Promise<{
        list: {
            totalExpense: number;
            dayPlans?: TripDayPlan[];
            id: string;
            title: string;
            destination: string;
            startDate: Date;
            endDate: Date;
            leaderId: string;
            status: string;
            templateId: string | null;
            inviteCode: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        pageSize: number;
        hasMore: boolean;
    }>;
    detail(id: string): Promise<{
        id: string;
        title: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        leaderId: string;
        status: string;
        templateId: string | null;
        inviteCode: string;
        createdAt: Date;
        updatedAt: Date;
        leader: UserRef;
        members: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: string;
            joinedAt: Date;
        }[];
        days: {
            id: string;
            day: number;
            date: Date | null;
            destination: string;
            description: string | null;
        }[];
        stats: {
            totalExpense: number;
            avgPerPerson: number;
            expenseCount: number;
            memberCount: number;
        };
    }>;
    update(id: string, dto: UpdateTripDto): Promise<{
        id: string;
        title: string;
        destination: string;
        startDate: Date;
        endDate: Date;
        leaderId: string;
        status: string;
        templateId: string | null;
        inviteCode: string;
        createdAt: Date;
        updatedAt: Date;
        leader: UserRef;
        members: {
            id: string;
            nickname: string;
            avatar: string | null;
            role: string;
            joinedAt: Date;
        }[];
        days: {
            id: string;
            day: number;
            date: Date | null;
            destination: string;
            description: string | null;
        }[];
        stats: {
            totalExpense: number;
            avgPerPerson: number;
            expenseCount: number;
            memberCount: number;
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
export {};
