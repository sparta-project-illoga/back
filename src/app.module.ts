import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PlanModule } from './plan/plan.module';
import { TravelModule } from './travel/travel.module';
import { LocalModule } from './local/local.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import Joi from 'joi';
import { User } from './user/entities/user.entity';
import { Travel } from './travel/entities/travel.entity';
import { Plan } from './plan/entities/plan.entity';
import { Local } from './local/entities/local.entity';
import { Category } from './category/entities/category.entity';
import { PostCommentModule } from './post-comment/post-comment.module';
import { LocationModule } from './location/location.module';
import { Location } from './location/entities/location.entity';
import { PostModule } from './post/post.module';
import { PostComment } from './post-comment/entities/post-comment.entity';
import { Post } from './post/entities/post.entity';
import { ScheduleModule } from './schedule/schedule.module';
import { Schedule } from './schedule/entities/schedule.entity';
import { Place } from './plan/entities/place.entity';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, Travel, Plan, Local, Schedule, Place, Post, PostComment, Location], // 엔티티는 반드시 여기에 명시!
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UserModule,
    PostModule,
    PostCommentModule,
    LocationModule,
    PlanModule,
    TravelModule,
    LocalModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
