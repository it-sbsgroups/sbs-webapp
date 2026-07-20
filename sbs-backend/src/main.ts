import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // In production this app sits behind a reverse proxy (nginx/etc), so
  // Express sees the proxy's IP on every request unless told to trust the
  // X-Forwarded-For header. This matters specifically for @Ip() usage
  // (e.g. one-like-per-IP on news articles) — without it every visitor
  // would appear to share the proxy's single IP.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser());

  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Non-browser tools (curl/server-to-server) send no Origin.
      if (!origin) return callback(null, true);
      // In development, allow localhost + any LAN device.
      if (process.env.NODE_ENV !== 'production') return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // required for cookie-based auth across origins
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
 
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 NestJS Backend running on ${port}`);
}
bootstrap();