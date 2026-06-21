import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsIn,
  ArrayMinSize,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

const CATEGORIES = [
  'food',
  'hotel',
  'transport',
  'ticket',
  'fuel',
  'toll',
  'parking',
  'other',
];

export class SplitDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  percentage?: number;
}

export class CreateExpenseDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsIn(CATEGORIES)
  category: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  payerId: string;

  @IsOptional()
  @IsString()
  @IsIn(['equal', 'percentage', 'custom'])
  splitType?: string;

  @ValidateIf((o) => o.splitType === 'equal' || !o.splitType)
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participants: string[];

  @ValidateIf((o) => o.splitType && o.splitType !== 'equal')
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SplitDto)
  splits?: SplitDto[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  receiptImage?: string;
}

export class UpdateExpenseDto {
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsString() @IsIn(CATEGORIES) category?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() payerId?: string;
  @IsOptional() @IsString() @IsIn(['equal', 'percentage', 'custom']) splitType?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) participants?: string[];
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SplitDto) splits?: SplitDto[];
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() exchangeRate?: number;
  @IsOptional() @IsString() note?: string;
  @IsOptional() @IsString() receiptImage?: string;
}

export class ListExpenseDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() payerId?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsString() keyword?: string;
}
