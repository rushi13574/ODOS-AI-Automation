import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { HealthController } from './health.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odos',
      autoLoadEntities: true,
      synchronize: true, // Use carefully in production!
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController, HealthController],
  providers: [UserService],
})
export class AppModule {}
