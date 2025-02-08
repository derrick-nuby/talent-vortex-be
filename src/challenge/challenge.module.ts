import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { ParseObjectIdPipe } from '../pipes/parse-object-id.pipe';
import { Category, CategorySchema } from '../category/schemas/category.schema';
import AnalyticsService from './analytics.service';
import { CacheModule } from '@nestjs/cache-manager';
import { AnalyticsController } from './analytics.controller';
import { Form, FormSchema } from '../form/schemas/form.schema';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { ApplicationService } from './services/application.service';
import { User, UserSchema } from '../user/schemas/user.schema';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { TeamInvitationController } from './team-invitation.controller';
import { SubmissionController } from './submission.controller';
import { Submission, SubmissionSchema } from './schemas/submission.schema';
import { SubmissionService } from './submission.service';

@Module({
  imports: [
    MailModule,
    UserModule,
    CacheModule.register(),
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Form.name, schema: FormSchema },
      { name: User.name, schema: UserSchema },
      { name: Application.name, schema: ApplicationSchema },
      { name: Submission.name, schema: SubmissionSchema }
    ]),
  ],
  providers: [ChallengeService, ParseObjectIdPipe, AnalyticsService, ApplicationService, SubmissionService],
  controllers: [ChallengeController, AnalyticsController, TeamInvitationController, SubmissionController]
})
export class ChallengeModule {}