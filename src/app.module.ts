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
import { AdminMiddleware } from './middlewares/AdminMiddleware';
import { SapService } from './sap/sap.service';
import { SapModule } from './sap/sap.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsService } from './cronjobs/cronjobs.service';
import { CronjobsModule } from './cronjobs/cronjobs.module';
import { YprService } from './ypr/ypr.service';
import { YprController } from './ypr/ypr.controller';
import { YprModule } from './ypr/ypr.module';
import { PurchaseAndAdminMiddleware } from './middlewares/PurchaseMiddleware';
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ScheduleModule.forRoot(),
    UserModule,
    AuthModule,
    ConfigModule.forRoot({}),
    DashboardModule,
    GrpoModule,
    SapModule,
    EmailModule,
    CronjobsModule,
    YprModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    DashboardController,
    GrpoController,
    YprController,
  ],
  providers: [
    AppService,
    UserService,
    AuthService,
    DashboardService,
    GrpoService,
    SapService,
    EmailService,
    CronjobsService,
    YprService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/auth/login',
        '/auth/generate-otp/:email',
        '/auth/verify-otp-password',
      )
      .forRoutes('*');
    consumer
      .apply(PurchaseAndAdminMiddleware)
      .forRoutes(
        'dashboard/admin',
        'dashboard/purchase',
        'user/created',
        'user/not-created',
        'user/disable-user',
        'user/enable-user',
        'user/delete-user',
        'user/edit-user',
        'user/edit-user',
        'grpo/all-invoices-grpos',
        'grpo/all-invoices-grpos/:id',
      );
  }
}
