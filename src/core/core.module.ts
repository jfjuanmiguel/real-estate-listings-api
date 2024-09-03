import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from '../config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './interceptors/transform-response/transform-response.interceptor';
import { LoggerService } from './logger/logger.service';
import { LoggerMiddleware } from './logger/logger.middleware';
import { DatabaseModule } from '../database/database.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache/cache.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CacheModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const username = configService.get('redis.username');
        const password = configService.get('redis.password');

        return {
          isGlobal: true,
          store: redisStore,
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          ...(username && { username }),
          ...(password && { password }),
          no_ready_check: true,
          ttl: 10,
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
    LoggerService,
    CacheService,
  ],
  exports: [LoggerService, CacheService],
})
export class CoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
