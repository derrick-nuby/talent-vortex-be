import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator";
import { UserRole } from "../enums/UserRole";

export class CreateUserDto {

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
    description: 'The role of the user',
    example: 'talent',
    enum: UserRole
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: string

}
