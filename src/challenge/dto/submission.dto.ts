import { IsArray, IsEnum, IsMongoId, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../enums/SubmissionStatus';

export class LinkDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  url: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;
}

export class CreateSubmissionDto {
  @IsMongoId()
  @ApiProperty()
  applicationId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @IsOptional()
  @ApiProperty({ required: false, type: [LinkDto] })
  deployedLinks?: LinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @IsOptional()
  @ApiProperty({ required: false, type: [LinkDto] })
  githubLinks?: LinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @IsOptional()
  @ApiProperty({ required: false, type: [LinkDto] })
  figmaLinks?: LinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  @IsOptional()
  @ApiProperty({ required: false, type: [LinkDto] })
  otherLinks?: LinkDto[];

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  submitterComments?: string;
}

export class AddFeedbackDto {
  @IsString()
  @ApiProperty()
  comment: string;

  @IsOptional()
  @ApiProperty({ required: false })
  isPrivate?: boolean;
}


export class UpdateSubmissionStatusDto {
  @IsEnum(SubmissionStatus)
  @ApiProperty({ enum: SubmissionStatus })
  status: SubmissionStatus;
}