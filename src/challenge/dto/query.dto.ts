import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max
} from "class-validator";
import { Type } from "class-transformer";
import { ChallengeStatus } from "../enums/ChallengeStatus";

export enum ChallengeSortField {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  START_DATE = 'startDate',
  END_DATE = 'endDate',
  STATUS = 'status'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class QueryChallengeDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term to filter challenges',
    required: false
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by challenge status',
    enum: ChallengeStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ChallengeSortField,
    default: ChallengeSortField.CREATED_AT
  })
  @IsOptional()
  @IsEnum(ChallengeSortField)
  sortField?: ChallengeSortField = ChallengeSortField.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}