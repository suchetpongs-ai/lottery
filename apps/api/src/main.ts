import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { HttpLoggingInterceptor } from './common/interceptors/http-logging.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Use Winston logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  // Global HTTP logging interceptor
  app.useGlobalInterceptors(app.get(HttpLoggingInterceptor));

  // Global exception filter
  app.useGlobalFilters(app.get(AllExceptionsFilter));

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
