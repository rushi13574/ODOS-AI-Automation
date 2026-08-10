import { Controller, Get, Patch, Post, Delete, Body, Headers, Param, UnauthorizedException, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Get('profile')
  async getProfile(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.userService.getProfile(uid);
  }

  @Patch('profile')
  async updateProfile(@Headers('x-user-id') userId: string | undefined, @Body() body: any) {
    const uid = this.checkUserId(userId);
    return this.userService.updateProfile(uid, body);
  }

  @Get('preferences')
  async getPreferences(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.userService.getPreferences(uid);
  }

  @Patch('preferences')
  async updatePreferences(@Headers('x-user-id') userId: string | undefined, @Body() body: any) {
    const uid = this.checkUserId(userId);
    return this.userService.updatePreferences(uid, body);
  }

  @Get('ai-provider')
  async getAiProvider(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.userService.getAiProvider(uid);
  }

  @Patch('ai-provider')
  async updateAiProvider(@Headers('x-user-id') userId: string | undefined, @Body() body: any) {
    const uid = this.checkUserId(userId);
    return this.userService.updateAiProvider(uid, body);
  }

  @Post('ai-provider/test')
  @HttpCode(200)
  async testAiProvider(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.userService.testAiProvider(uid);
  }

  @Delete('ai-provider')
  async deleteAiProvider(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.userService.deleteAiProvider(uid);
  }

  @Get('internal/user/:userId/decrypted-api-key')
  async getDecryptedApiKey(@Param('userId') userId: string) {
    return this.userService.getDecryptedApiKey(userId);
  }
}
