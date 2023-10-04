import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardModule } from './dashboard/dashboard.module';
import { GrpoService } from './grpo/grpo.service';
import { GrpoController } from './grpo/grpo.controller';

import { GrpoModule } from './grpo/grpo.module';
import { AuthMiddleware } from './auth/auth.middleware';
@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({}),
    DashboardModule,
    GrpoModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    DashboardController,
    GrpoController,
  ],
  providers: [
    AppService,
    UserService,
    AuthService,
    DashboardService,
    GrpoService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/login').forRoutes('*');
  }
}
