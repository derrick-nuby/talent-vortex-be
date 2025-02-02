import { Injectable } from '@nestjs/common';
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService
  ) {}

  async sendVerificationEmail(email: string, name: string, token: string) {
    try {

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify you Email address',
        template: './verify-email',
        context: {
          name: name,
          verificationLink: verificationLink
        }
      })

    }catch (error) {
      console.log('Error sending email', error);
    }

  }

  async sendPasswordCreatingEmail(email:string, names: string, token: string) {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const passwordCreationLink = `${frontendUrl}/create-password?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Create password',
        template: './create-password',
        context: {
          name: names,
          passwordCreationLink: passwordCreationLink
        }
      })

    } catch (error) {
      console.log('Error sending email', error);
    }
  }

}
