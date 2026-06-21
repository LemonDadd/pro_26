import { UserService } from './user.service';
declare class BatchUsersDto {
    userIds: string[];
}
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getById(id: string): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }>;
    batch(dto: BatchUsersDto): Promise<{
        id: string;
        nickname: string;
        avatar: string | null;
    }[]>;
}
export {};
