import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './swagger';
import { useContainer } from 'class-validator';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';

import * as csurf from 'csurf';
import * as helmet from 'helmet';

function readCsrfToken(req) {
  return req.csrfToken();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
  });
  setupSwagger(app);
  /**
   * Enable Cors for development
   */
  app.enableCors();
  /**
   * Global Pipe to intercept request and format data accordingly
   */

  if (configService.get('APP_ENV') != 'dev') {
    app.use(csurf({ cookie: true, httpOnly: true, value: readCsrfToken }));
    app.use(helmet());
  }
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  /**
   * Listen to port given by environment on production server (Heroku, DigitalOcean App,..), otherwise 3000
   * Specify '0.0.0.0' in the listen() to accept connections on other hosts.
   */
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
