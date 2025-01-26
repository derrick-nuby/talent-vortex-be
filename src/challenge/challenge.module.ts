import { Module } from "@nestjs/common";
import { ChallengeService } from "./challenge.service";
import { ChallengeController } from "./challenge.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Challenge, ChallengeSchema } from "./schemas/challenge.schema";
import { ParseObjectIdPipe } from "../pipes/parse-object-id.pipe";
import { Category, CategorySchema } from '../category/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])
  ],
  providers: [ChallengeService, ParseObjectIdPipe],
  controllers: [ChallengeController]
})
export class ChallengeModule {}