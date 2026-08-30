import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { HealthController } from './health.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { ConfigModule } from '@nestjs/config';

const isProd = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL;
if (isProd && !dbUrl) {
  throw new Error('DATABASE_URL environment variable is strictly required in production.');
}
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: dbUrl || 'postgresql://postgres:postgres@localhost:5432/odos',
      autoLoadEntities: true,
      synchronize: true,
    }),

    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController, HealthController],
  providers: [UserService],
})
export class AppModule { }
