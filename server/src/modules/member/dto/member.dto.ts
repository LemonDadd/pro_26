import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  nickname: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class JoinByCodeDto {
  @IsString()
  @IsNotEmpty()
  inviteCode: string;
}
