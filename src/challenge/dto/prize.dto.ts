import { IsString, IsNumber, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrizeDto {
  @ApiProperty({
    example: '1st',
    description: 'The rank of the prize (e.g., 1st, 2nd, 3rd)',
  })
  @IsString()
  @IsNotEmpty()
  place: string;

  @ApiProperty({
    example: 300000,
    description: 'The minimum value of the prize',
  })
  @IsNumber()
  @Min(0, { message: 'Minimum value must be greater than or equal to 0' })
  minValue: number;

  @ApiProperty({
    example: 500000,
    description: 'The maximum value of the prize',
  })
  @IsNumber()
  @Min(0, { message: 'Maximum value must be greater than or equal to 0' })
  @Max(1000000, { message: 'Maximum value must be less than or equal to 1,000,000' })
  maxValue: number;
}