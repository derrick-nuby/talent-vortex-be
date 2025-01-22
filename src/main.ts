import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix =  'api';
  const config = new DocumentBuilder()
    .setTitle('Talent Vortex API')
    .setDescription('Talent API description')
    .setVersion('1.0')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, documentFactory)

  app.useGlobalPipes(new ValidationPipe({
    transform: true
  }))

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/']
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
