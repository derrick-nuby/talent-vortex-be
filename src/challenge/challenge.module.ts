import { Module } from "@nestjs/common";
import { ChallengeService } from "./challenge.service";
import { ChallengeController } from "./challenge.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Challenge, ChallengeSchema } from "./schemas/challenge.schema";
import { ParseObjectIdPipe } from "../pipes/parse-object-id.pipe";
import { Category, CategorySchema } from '../category/schemas/category.schema';
import AnalyticsService from './analytics.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])
  ],
  providers: [ChallengeService, ParseObjectIdPipe, AnalyticsService],
  controllers: [ChallengeController, AnalyticsController]
})
export class ChallengeModule {}