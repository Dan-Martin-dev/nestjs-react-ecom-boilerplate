import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Request, Response, NextFunction, RequestHandler } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable compression (wrap runtime middleware call to keep typings clean)
  app.use(((req: Request, res: Response, next: NextFunction) => {
    // Call runtime middleware directly and forward to next.
    // compression() has runtime any typing; single-line disable for the call below.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    (compression() as unknown as RequestHandler)(req, res, next);
  }) as unknown as (req: Request, res: Response, next: NextFunction) => void);

  // Enable CORS for frontend. Allow common local dev origins and any configured via CORS_ORIGIN.
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];
  const configured = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : [];
  const allowedOrigins = Array.from(
    new Set([...configured, ...defaultOrigins]),
  );

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Global input validation
  // const { ValidationPipe } = await import('@nestjs/common');
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     forbidNonWhitelisted: true,
  //     transform: true,
  //   }),
  // );

  // Security middleware
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Exception filter
  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription('API for the e-commerce application')
    .setVersion('1.0')
    .addTag('products', 'Product management endpoints')
    .addTag('categories', 'Category management endpoints')
    .addTag('auth', 'Authentication endpoints')
    .addTag('cart', 'Shopping cart endpoints')
    .addTag('orders', 'Order management endpoints')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // HTTPS config for Traefik (if behind proxy)
  if (process.env.SSL_ENABLED === 'true') {
    // Traefik will handle SSL termination, but you can enforce HTTPS redirect if needed
    app.use((req: Request, res: Response, next: NextFunction) => {
      const proto = req.headers['x-forwarded-proto'];
      // Only redirect when header exists and is not https
      if (typeof proto === 'string' && proto !== 'https') {
        const host = String(req.headers.host ?? '');
        return res.redirect('https://' + host + req.url);
      }
      next();
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    void app.close();
  });

  // Listen on provided port
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}

void bootstrap();
