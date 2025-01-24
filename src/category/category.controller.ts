import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from "@nestjs/common";
import CreateCategoryDto from "./dto/create-category.dto";
import { CategoryService } from "./category.service";
import UpdateCategoryDto from "./dto/update-category.dto";
import { ParseObjectIdPipe } from "./pipes/parse-object-id.pipe";
import { PaginationResponse } from "../types";
import { Category } from "./schemas/category.schema";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

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

  @ApiOperation({ summary: 'Retrieve paginated categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories with pagination metadata'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    default: 1,
    type: Number,
    description: 'Page number'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    default: 10,
    type: Number,
    description: 'Number of items per page'
  })
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ): Promise<PaginationResponse<Category>> {
    const { categories, total } = await this.categoryService.findAll(
      Number(page),
      Number(limit)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories,
      pagination: {
        totalItems: total,
        itemCount: categories.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
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
