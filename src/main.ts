import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as process from "process";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix =  'api';
  const config = new DocumentBuilder()
    .setTitle('Talent Vortex API')
    .setDescription('Talent API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('https://talent-vortex-be-v1.onrender.com', 'Production Server')
    .addTag('Challenge categories')
    .addTag('Forms')
    .addTag('Challenges')
    .addTag('Challenge Analytics')
    .addTag('Users')
    .addTag('Authentication')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT Token',
      in: 'header'
    }, 'JWT-auth')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory)

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }))

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/']
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
