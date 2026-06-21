import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { throwBiz, ErrorCodes } from '@/common/exceptions/business.exception';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwBiz(ErrorCodes.USER_NOT_FOUND);
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
    };
  }

  async findByIds(ids: string[]) {
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } } });
    return users.map((u) => ({
      id: u.id,
      nickname: u.nickname,
      avatar: u.avatar,
    }));
  }
}
