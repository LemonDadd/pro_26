import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { CreateVehicleDto, UpdateVehicleDto, CreateFuelSubsidyDto } from './dto/vehicle.dto';
type UserRef = {
    id: string;
    nickname: string;
    avatar: string | null;
};
export declare class VehicleService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    list(tripId: string): Promise<{
        list: {
            fuelCost: number;
            id: string;
            tripId: string;
            plateNumber: string | null;
            model: string;
            capacity: number;
            fuelConsumption: number | null;
            ownerId: string;
            owner: UserRef;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    detail(id: string, userId: string): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: UserRef;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(tripId: string, dto: CreateVehicleDto): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: UserRef;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, userId: string, dto: UpdateVehicleDto): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: UserRef;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        id: string;
    }>;
    private ensureTripMember;
    createFuelSubsidy(tripId: string, userId: string, dto: CreateFuelSubsidyDto): Promise<{
        id: string;
        expenseId: string;
        totalAmount: number;
    }>;
    listFuelSubsidy(tripId: string): Promise<{
        list: ({
            vehicle: {
                id: string;
                plateNumber: string | null;
                model: string;
            };
        } & {
            id: string;
            createdAt: Date;
            tripId: string;
            note: string | null;
            expenseId: string | null;
            vehicleId: string;
            fuelDate: Date;
            fuelAmount: number;
            fuelPrice: number;
            totalAmount: number;
            isSplit: boolean;
        })[];
        total: number;
    }>;
    private formatVehicle;
}
export {};
