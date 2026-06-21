import { PrismaService } from '@/prisma/prisma.service';
export declare function generateUniqueInviteCode(prisma: PrismaService): Promise<string>;
