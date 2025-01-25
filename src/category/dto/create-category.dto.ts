import { IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export default class CreateCategoryDto {

  @ApiProperty({
    description: 'Name of the category',
    minLength: 3,
    maxLength: 50,
    example: 'Web development'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(50, { message: 'Name must be at most 50 characters long' })
  name: string;

  @ApiProperty({
    description: 'Optional description of the category',
    minLength: 10,
    maxLength: 200,
    required: false,
    example: 'Challenges related to building websites and web applications.'
  })
  @IsString()
  @IsOptional()
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(200, { message: 'Description must be at most 200 characters long' })
  description?: string;

  @ApiProperty({
    description: 'Optional tags for the category',
    type: [String],
    required: false,
    example: ["frontend","backend","fullstack"]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

}