import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class TripController {
    private readonly tripService;
    constructor(tripService: TripService);
    create(user: JwtPayload, dto: CreateTripDto): Promise<{
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
        leader: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
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
    list(user: JwtPayload, status?: string, page?: string, pageSize?: string): Promise<{
        list: {
            totalExpense: number;
            dayPlans?: import(".prisma/client").TripDayPlan[];
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
        leader: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
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
        leader: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
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
    summary(id: string): Promise<{
        totalExpense: number;
        avgPerPerson: number;
        expenseCount: number;
        memberCount: number;
        categoryStats: import("../../utils/aa-calculator").CategoryStat[];
    }>;
}
