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

  // Set global prefix (Only in Dev, because Prod Nginx strips /api)
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`[DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[DEBUG] Is Production: ${isProduction}`);

  if (!isProduction) {
    console.log('[DEBUG] Setting Global Prefix: api');
    app.setGlobalPrefix('api');
  } else {
    console.log('[DEBUG] Skipping Global Prefix (Production)');
  }

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins temporarily for debugging
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
