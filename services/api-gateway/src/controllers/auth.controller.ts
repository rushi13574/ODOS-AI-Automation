import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserServiceClient } from '../clients/user-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly userServiceClient: UserServiceClient) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    return this.userServiceClient.getProfile(req);
  }
}
