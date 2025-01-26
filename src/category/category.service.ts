import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Category } from "./schemas/category.schema";
import CreateCategoryDto from "./dto/create-category.dto";
import UpdateCategoryDto from "./dto/update-category.dto";
import { generateSlug } from '../utils';

@Injectable()
export class CategoryService {
  @InjectModel(Category.name)
  private readonly categoryModel: Model<Category>

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const slug = generateSlug(createCategoryDto.name);

    const existingCategory = await this.categoryModel.findOne({
      $or: [{ name: createCategoryDto.name }, { slug }]
    }).exec();

    if (existingCategory) {
      throw new ConflictException('Category with this name or slug already exists');
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      slug
    });

    return category.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find()
      .sort({ createdAt: -1 })
      .select('-__v');
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryModel.findById(id).exec();

    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const slug = updateCategoryDto.name
      ? generateSlug(updateCategoryDto.name)
      : existingCategory.slug;

    const duplicateCheck = await this.categoryModel.findOne({
      $or: [
        { name: updateCategoryDto.name },
        { slug }
      ],
      _id: { $ne: id }
    }).exec();

    if (duplicateCheck) {
      throw new ConflictException('Category name or slug must be unique');
    }

    return this.categoryModel.findByIdAndUpdate(
      id,
      { ...updateCategoryDto, slug },
      { new: true, runValidators: true }
    );
  }

  async remove(id: string): Promise<Category> {
    const category = await this.categoryModel.findByIdAndDelete(id);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }


}