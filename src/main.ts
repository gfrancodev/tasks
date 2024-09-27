import { NestFactory } from '@nestjs/core';
import { App } from './app';
import helmet from 'helmet';
import { useContainer } from 'class-validator';
import * as compression from 'compression';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { gracefulShutdown } from './infraestructure/helpers/grace-full-shutdown-helper';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MysqlConnection } from './infraestructure/connections/mysql';

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

  app.get(MysqlConnection, { strict: false });
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
  .setTitle('TASK - API')
  .setDescription('[BACKEND] Sistema de gestão de tarefas multiusuário.')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/doc', app, document);

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
  const PORT = configService.get('PORT') || 3000;

  await app.listen(Number(PORT));

  process.on('SIGINT', async (signal) => await gracefulShutdown(signal, app));
  process.on('SIGTERM', async (signal) => await gracefulShutdown(signal, app));

  return {
    PORT,
  };
}
bootstrap()
  .then(async ({ PORT }) => {
    logger.log(`RUNNING IN PORT ${PORT}`);
    logger.log(`API DOCUMENTATION http://localhost:${PORT}/doc`);
  })
  .catch((err) => {
    logger.error(err);
    process.exit(1);
  });
