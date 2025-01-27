import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { Form } from './schemas/form.schema';
import { ParseObjectIdPipe } from '../pipes/parse-object-id.pipe';

@ApiTags('Forms')
@Controller('forms')
export class FormController {

  constructor(
    private readonly formService: FormService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new form' })
  async create(@Body() createFormDto: CreateFormDto): Promise<Form> {
    return this.formService.create(createFormDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a form by id' })
  @ApiParam({ name: 'id', description: 'Form identifier' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string): Promise<Form> {
    return this.formService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a form' })
  @ApiParam({ name: 'id', description: 'Form identifier' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    return this.formService.remove(id);
  }


}
