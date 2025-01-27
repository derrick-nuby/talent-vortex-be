import { TimeRange } from '../enums/TimeRange';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyticsQueryDto {
  @IsEnum(TimeRange)
  @IsOptional()
  @ApiPropertyOptional({
    enum: TimeRange,
    default: TimeRange.LAST_30_DAYS,
    description: 'Time range for analytics data'
  })
  timeRange?: TimeRange = TimeRange.LAST_30_DAYS;
}
