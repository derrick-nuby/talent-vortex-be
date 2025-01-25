import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import CreateCategoryDto from "./dto/create-category.dto";
import { CategoryService } from "./category.service";
import UpdateCategoryDto from "./dto/update-category.dto";
import { ParseObjectIdPipe } from "../pipes/parse-object-id.pipe";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller('categories')
@ApiTags('Challenge categories')
export class CategoryController {

  constructor(
    private readonly categoryService: CategoryService
  ) {}

  @ApiOperation({ summary: 'Create a new category' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of all categories'
  })
  async findAll() {
    return this.categoryService.findAll();
  }


  @ApiOperation({ summary: 'Retrieve a specific category by ID' })
  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an existing category' })
  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @ApiOperation({ summary: 'Delete a category' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.remove(id);
  }

}