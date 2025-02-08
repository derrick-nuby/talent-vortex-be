import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { SubmissionStatus } from '../enums/SubmissionStatus';

export class QuerySubmissionsDto{
  @ApiPropertyOptional({ description: 'Page number (default: 1)', example: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Limit per page (default: 10)', example: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Filter by submission status', enum: SubmissionStatus })
  @IsOptional()
  status?: SubmissionStatus;
}