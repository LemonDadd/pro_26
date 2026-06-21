import { TripService } from './trip.service';
import { CreateTripDto, UpdateTripDto } from './dto/trip.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class TripController {
    private readonly tripService;
    constructor(tripService: TripService);
    create(user: JwtPayload, dto: CreateTripDto): Promise<{
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
    list(user: JwtPayload, status?: string, page?: string, pageSize?: string): Promise<{
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
    summary(id: string): Promise<{
        totalExpense: number;
        avgPerPerson: number;
        expenseCount: number;
        memberCount: number;
        categoryStats: import("../../utils/aa-calculator").CategoryStat[];
    }>;
}
