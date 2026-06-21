export declare class DayPlanDto {
    day: number;
    date?: string;
    destination: string;
    description?: string;
}
export declare class CreateTripDto {
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    templateId?: string;
    days?: DayPlanDto[];
}
export declare class UpdateTripDto {
    title?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    days?: DayPlanDto[];
}
export declare class ApplyTemplateDto {
    title?: string;
    destination?: string;
    startDate: string;
    endDate: string;
}
