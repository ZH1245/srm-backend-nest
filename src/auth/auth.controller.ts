import { Body, Controller, Get, Param, Patch, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ValidationPipe } from '@nestjs/common/pipes';
import { UsePipes } from '@nestjs/common/decorators';
import {
  GenerateOTPValidatorDTO,
  LoginValidatorDTO,
  VerifyOTPPasswordValidatorDTO,
} from './validator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }))
  async login(@Body() body: LoginValidatorDTO, @Res() res: Response) {
    console.log(body);
    const result = await this.authService.login(body);
    // res.cookie('auth', result.token, { httpOnly: true, sameSite: 'strict' });
    return res.json(result);
  }

  @Post('register')
  async register() {
    return this.authService.register();
  }

  @Get('generate-otp/:email')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async generateOTP(
    @Param('email') email: GenerateOTPValidatorDTO['EMAIL'],
    @Res() res: Response,
  ) {
    const result = await this.authService.generateOTP(email);
    return res.json(result);
  }

  @Patch('verify-otp-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verifyOTPAndUpdatePassword(
    @Body() body: VerifyOTPPasswordValidatorDTO,
    @Res() res: Response,
  ) {
    const result = await this.authService.verifyOTPAndUpdatePassword(body);
    return res.json(result);
  }
}
