import { PrismaService } from '@/prisma/prisma.service';
import { ActivityService } from '@/modules/activity/activity.service';
import { CreateVehicleDto, UpdateVehicleDto, CreateFuelSubsidyDto } from './dto/vehicle.dto';
export declare class VehicleService {
    private readonly prisma;
    private readonly activityService;
    constructor(prisma: PrismaService, activityService: ActivityService);
    list(tripId: string): Promise<{
        list: {
            fuelCost: number;
            id: any;
            tripId: any;
            plateNumber: any;
            model: any;
            capacity: any;
            fuelConsumption: any;
            ownerId: any;
            owner: any;
            createdAt: any;
            updatedAt: any;
        }[];
        total: number;
    }>;
    detail(id: string): Promise<{
        id: any;
        tripId: any;
        plateNumber: any;
        model: any;
        capacity: any;
        fuelConsumption: any;
        ownerId: any;
        owner: any;
        createdAt: any;
        updatedAt: any;
    }>;
    create(tripId: string, dto: CreateVehicleDto): Promise<{
        id: any;
        tripId: any;
        plateNumber: any;
        model: any;
        capacity: any;
        fuelConsumption: any;
        ownerId: any;
        owner: any;
        createdAt: any;
        updatedAt: any;
    }>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        id: any;
        tripId: any;
        plateNumber: any;
        model: any;
        capacity: any;
        fuelConsumption: any;
        ownerId: any;
        owner: any;
        createdAt: any;
        updatedAt: any;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
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
