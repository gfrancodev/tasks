import { NestFactory } from '@nestjs/core';
import { App } from './app';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import * as compression from 'compression';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gracefulShutdown } from './infraestructure/helpers/grace-full-shutdown-helper';

const logger = new Logger(bootstrap.name);

async function bootstrap() {
  const app = await NestFactory.create(App, {
    cors: true,
    snapshot: true,
    forceCloseConnections: true,
    abortOnError: false,
  });

  app.enableCors({
    origin: '*',
  });
  app.use(helmet());
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
    }),
  );

  useContainer(app.select(App), { fallbackOnErrors: true });

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') ?? 3000;

  await app.listen(PORT);

  process.on('SIGINT', async (signal) => await gracefulShutdown(signal, app));
  process.on('SIGTERM', async (signal) => await gracefulShutdown(signal, app));

  return {
    PORT,
  };
}
bootstrap()
  .then(async ({ PORT }) => {
    logger.log(`RUNNING IN PORT ${PORT}`);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
