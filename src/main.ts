import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as process from "process";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";

async function bootstrap() {

  const apiPrefix = 'api';

  const config = new DocumentBuilder()
    .setTitle('Talent Vortex API')
    .setDescription('Talent API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('', 'Production Server')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT Token',
      in: 'header'
    }, 'JWT-auth')
    .build()

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documentFactory);

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/']
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }))

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
