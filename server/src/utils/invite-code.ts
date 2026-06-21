import { PrismaService } from '@/prisma/prisma.service';
import { generateInviteCode } from '@/utils/aa-calculator';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

const MAX_RETRIES = 10;

export async function generateUniqueInviteCode(
  prisma: PrismaService,
): Promise<string> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const code = generateInviteCode();
    const existing = await prisma.trip.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  throwBiz(ErrorCodes.INTERNAL_ERROR, '生成唯一邀请码失败，请重试');
}
