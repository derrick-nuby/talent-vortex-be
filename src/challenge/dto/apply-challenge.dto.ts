import { IsArray, IsEmail, IsNotEmpty, ValidateIf } from 'class-validator';
import { ApplicationType } from '../schemas/application.schema';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyChallengeDto {
  @ApiProperty({
    description: 'List of team member emails, required if the application type is team',
    type: [String],
    required: false,
    example: ['member1@example.com', 'member2@example.com'],
  })
  @ValidateIf(o => o.type === ApplicationType.TEAM)
  @IsArray()
  @IsEmail({}, { each: true })
  @IsNotEmpty({ each: true })
  teamMembers?: string[];
}
