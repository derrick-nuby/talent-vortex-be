import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./schemas/category.schema";
import { ParseObjectIdPipe } from "./pipes/parse-object-id.pipe";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Category.name,
        schema: CategorySchema,
        discriminators: []
      }
    ])
  ],
  providers: [CategoryService, ParseObjectIdPipe],
  controllers: [CategoryController]
})
export class CategoryModule {}
