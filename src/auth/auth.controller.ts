import { Body, Controller, Patch, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './type';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    console.log(body);
    const result = await this.authService.login(body);
    res.cookie('auth', result.token, { httpOnly: true, sameSite: 'strict' });
    return res.json(result);
  }

  @Post('register')
  async register() {
    return this.authService.register();
  }

  @Post('generate-otp')
  async generateOTP() {
    return this.authService.generateOTP();
  }

  @Patch('verify-otp-password')
  async verifyOTPAndUpdatePassword() {
    return this.authService.verifyOTPAndUpdatePassword();
  }
}
