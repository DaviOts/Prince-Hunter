import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { WatchlistStatus } from '@prisma/client';

export class UpdateWatchlistDto {
  @IsOptional()
  @IsEnum(WatchlistStatus, {
    message:
      'Status is not valid. Choose one of the following: PLAYING, COMPLETED, DROPPED, PLAN_TO_PLAY',
  })
  status?: WatchlistStatus;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  review?: string;
}
