import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  ValidateNested,
  ArrayMinSize,
  IsArray,
  MaxLength,
  MinLength,
  IsObject,
  Matches,
  ValidateIf
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldType } from '../schemas/form.schema';

export class OptionDto {
  @ApiProperty({ description: 'Display label for the option' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiProperty({ description: 'Value of the option' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Option value can only contain letters, numbers, underscores and dashes'
  })
  value: string;
}

export class ValidationDto {
  @ApiProperty({ description: 'Type of validation', example: 'required' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Value for the validation rule' })
  @IsNotEmpty()
  value: any;

  @ApiPropertyOptional({ description: 'Custom error message' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  message?: string;
}

export class FieldDto {
  @ApiProperty({ description: 'Field name/identifier' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]*$/, {
    message: 'Field name must start with a letter and can only contain letters, numbers and underscores'
  })
  name: string;

  @ApiProperty({ description: 'Display label for the field' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label: string;

  @ApiProperty({
    description: 'Field type',
    enum: FieldType,
    example: FieldType.TEXT
  })
  @IsEnum(FieldType, {
    message: 'Invalid field type'
  })
  type: FieldType;

  @ApiPropertyOptional({
    description: 'Options for select, multiselect, radio, or checkbox fields',
    type: [OptionDto]
  })
  @ValidateIf((o) => [
    FieldType.SELECT,
    FieldType.MULTISELECT,
    FieldType.RADIO,
    FieldType.CHECKBOX
  ].includes(o.type))
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OptionDto)
  options?: OptionDto[];

  @ApiPropertyOptional({
    description: 'Validation rules for the field',
    type: [ValidationDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationDto)
  validations?: ValidationDto[];

  @ApiPropertyOptional({ description: 'Placeholder text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  placeholder?: string;

  @ApiPropertyOptional({ description: 'Default value' })
  @IsOptional()
  defaultValue?: any;

  @ApiPropertyOptional({ description: 'Field description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional HTML attributes',
    example: { autocomplete: 'off', maxlength: 100 }
  })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}

export class CreateFormDto {
  @ApiProperty({
    description: 'Form title',
    example: 'Contact Us Form'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({
    description: 'Form description',
    example: 'Please fill out this form to contact us'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Form fields',
    type: [FieldDto],
    example: [{
      name: 'email',
      label: 'Email Address',
      type: FieldType.EMAIL,
      validations: [
        { type: 'required', value: true }
      ]
    }]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => FieldDto)
  fields: FieldDto[];
}