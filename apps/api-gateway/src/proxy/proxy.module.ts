import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [HttpModule.register({ timeout: 30000 })],
  controllers: [ProxyController],
})
export class ProxyModule {}
