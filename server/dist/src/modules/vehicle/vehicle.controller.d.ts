import { VehicleService } from './vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto, CreateFuelSubsidyDto } from './dto/vehicle.dto';
import { JwtPayload } from '@/common/decorators/current-user.decorator';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
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
            owner: {
                id: string;
                nickname: string;
                avatar: string | null;
            };
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
    }>;
    create(tripId: string, dto: CreateVehicleDto): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    detail(id: string): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        id: string;
        tripId: string;
        plateNumber: string | null;
        model: string;
        capacity: number;
        fuelConsumption: number | null;
        ownerId: string;
        owner: {
            id: string;
            nickname: string;
            avatar: string | null;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
    }>;
    fuelSubsidy(tripId: string, user: JwtPayload, dto: CreateFuelSubsidyDto): Promise<{
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
}
