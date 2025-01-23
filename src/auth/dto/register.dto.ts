import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {

  @ApiProperty({
    description: 'First name of the user',
    example: 'Byiringiro',
    minLength: 2
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'The first name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Dieudonne',
    minLength: 2
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'The last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'byiringiro77@gmail.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'The password of the user',
    example: 'Pa$$word123@#',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string

}