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
import { Form, FormSchema } from '../form/schemas/form.schema';

@Module({
  imports: [
    CacheModule.register(),
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Form.name, schema: FormSchema }
    ]),
  ],
  providers: [ChallengeService, ParseObjectIdPipe, AnalyticsService],
  controllers: [ChallengeController, AnalyticsController]
})
export class ChallengeModule {}