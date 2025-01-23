import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Talent Vortex API v.1.0';
  }
}
