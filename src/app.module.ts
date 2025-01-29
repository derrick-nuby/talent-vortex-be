import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ChallengeModule } from './challenge/challenge.module';
import { FormModule } from './form/form.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ ],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService]
    }),
    UserModule,
    MailModule,
    AuthModule,
    CategoryModule,
    ChallengeModule,
    FormModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
