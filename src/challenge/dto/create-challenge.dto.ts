import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail, IsEnum,
  IsMongoId,
  IsNotEmpty, IsNumber,
  IsString, Min, ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { PrizeDto } from "./prize.dto";
import { ChallengeType } from '../enums/ChallengeType';

export class CreateChallengeDto {

  @ApiProperty({
    example: 'Build a Portfolio Website',
    description: 'The title of the challenge',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'Create a responsive portfolio website using HTML, CSS, and JavaScript.',
    description: 'The description of the challenge',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 'admin@example.com',
    description: 'The email of the challenge creator',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '1. Design the layout\n2. Implement the contact form',
    description: 'The tasks required to complete the challenge',
  })
  @IsString()
  tasks: string;

  @ApiProperty({
    type: [PrizeDto],
    example: [
      { place: '1st', minValue: 300000, maxValue: 500000 },
      { place: '2nd', minValue: 150000, maxValue: 250000 },
    ],
    description: 'The prizes for the challenge',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one prize is required' })
  @Type(() => PrizeDto)
  prizes: PrizeDto[];

  @ApiProperty({
    example: ['HTML', 'CSS', 'JavaScript'],
    description: 'The skills needed to complete the challenge',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one skill is required' })
  skillsNeeded: string[];

  @ApiProperty({
    example: 'beginner',
    description: 'The juniority level required for the challenge',
  })
  @IsString()
  @IsNotEmpty()
  juniorityLevel: string;

  @ApiProperty({
    example: '2023-11-01T00:00:00.000Z',
    description: 'The start date of the challenge',
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    example: '2023-11-15T00:00:00.000Z',
    description: 'The end date of the challenge',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    enum: ChallengeType,
    example: ChallengeType.INDIVIDUAL,
    description: 'Type of challenge (individual or team)'
  })
  @IsEnum(ChallengeType)
  type: ChallengeType;

  @ApiProperty({
    example: 3,
    description: 'Required team size (only for team challenges)',
    required: false
  })
  @ValidateIf(o => o.type === ChallengeType.TEAM)
  @IsNumber()
  @Min(2)
  teamSize?: number;


  @ApiProperty({
    example: '64f8a1b2e4b0f5a3d8f8f8f8',
    description: 'The ID of the category the challenge belongs to',
  })
  @IsString()
  @IsNotEmpty()
  @IsMongoId({ message: 'Invalid MongoDB ID for category' })
  category: string;
}