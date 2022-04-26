/**
 * This is a common config file for project
 * Staging environment for testing the latest code on branch develop on Heroku
 * After the develop branch is merged, it will automatically trigger Heroku deployment
 * APP_ENV is used in Heroku environment as 'production'
 * --
 * Docker is used only for local development
 * When developing locally, APP_ENV = dev is used
 */
import * as redisStore from 'cache-manager-redis-store';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { CacheModuleOptions } from '@nestjs/common';
import { join } from 'path';

export async function redisConfig(configService: ConfigService) {
  const env = configService.get<string>('APP_ENV');
  if (env === 'dev') {
    return {
      ttl: configService.get('CACHE_TTL'), // seconds
      max: configService.get('CACHE_MAX'), // maximum number of items in cache
      store: redisStore,
      host: configService.get('CACHE_HOST'),
      port: configService.get('CACHE_PORT'),
    } as CacheModuleOptions;
  }
  if (env === 'production') {
    return {
      ttl: configService.get('CACHE_TTL'), // seconds
      max: configService.get('CACHE_MAX'), // maximum number of items in cache
      store: redisStore,
      url: configService.get('REDIS_URL'),
      tls: {
        servername: configService.get('CACHE_HOST'),
        rejectUnauthorized: false,
      },
    };
  }
}
export async function typeormConfig(configService: ConfigService) {
  const env = configService.get<string>('APP_ENV');
  if (env === 'dev') {
    return {
      type: configService.get<string>('DB_TYPE'),
      host: configService.get<string>('DB_HOST'),
      port: configService.get<string>('DB_PORT'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      database: configService.get<string>('DB_DATABASE'),
      // logging: true,
      synchronize: false,
      migrationsRun: true,
      dropSchema: false,
      entities: [join(__dirname, './../**/**.entity{.ts,.js}')],
      migrations: [join(__dirname, './../../migrations/{.ts,*.js}')],
      cli: {
        migrationsDir: 'src/migrations',
      },
    } as TypeOrmModuleAsyncOptions;
  }
  if (env === 'production') {
    return {
      type: configService.get<string>('DB_TYPE'),
      url: configService.get<string>('DATABASE_URL'),
      username: configService.get<string>('DB_USERNAME'),
      password: configService.get<string>('DB_PASSWORD'),
      entities: [__dirname + './../**/**.entity{.ts,.js}'],
      subscribers: [__dirname + './../**/**/*.subscriber.{ts,js}'],
      migrations: [join(__dirname, './../../migrations/{.ts,*.js}')],
      synchronize: false,
      /**
       * Migration is automatically performed on staging server
       * by putting migrationsRun: true
       */
      migrationsRun: true,
      ssl: true,
      retryAttempts: 20,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    } as TypeOrmModuleAsyncOptions;
  }
}
export async function throttlerConfig(configService: ConfigService) {
  const env = configService.get<string>('APP_ENV');
  let redisObj;
  if (env === 'dev') {
    redisObj = {
      host: configService.get('CACHE_HOST'),
      port: configService.get('CACHE_PORT'),
    };
  } else if (env === 'production') {
    redisObj = {
      host: configService.get('CACHE_HOST'),
      port: configService.get('CACHE_PORT'),
      username: configService.get('CACHE_USER'),
      password: configService.get('CACHE_PASSWORD'),
      tls: {
        servername: configService.get('CACHE_HOST'),
        rejectUnauthorized: false,
      },
    };
  }
  return {
    ttl: configService.get('THROTTLE_TTL'),
    limit: configService.get('THROTTLE_LIMIT'),
    storage: new ThrottlerStorageRedisService(redisObj),
  };
}
