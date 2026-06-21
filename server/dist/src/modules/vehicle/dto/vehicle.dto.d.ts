export declare class CreateVehicleDto {
    plateNumber?: string;
    model: string;
    capacity?: number;
    fuelConsumption?: number;
    ownerId: string;
}
export declare class UpdateVehicleDto {
    plateNumber?: string;
    model?: string;
    capacity?: number;
    fuelConsumption?: number;
}
export declare class CreateFuelSubsidyDto {
    vehicleId: string;
    fuelDate: string;
    fuelAmount: number;
    fuelPrice: number;
    totalAmount: number;
    isSplit?: boolean;
    note?: string;
}
