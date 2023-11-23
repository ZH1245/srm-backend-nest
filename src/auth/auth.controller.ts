// -------------------------------------------------------------------------
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
// -------------------------------------------------------------------------

@Controller('auth')
/**
 * Controller for handling authentication related requests.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Logs in a user with the provided credentials.
   * @param body - The login credentials of the user.
   * @param res - The HTTP response object.
   * @returns The result of the login attempt.
   */
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }))
  async login(@Body() body: LoginValidatorDTO, @Res() res: Response) {
    // console.log(body);
    const result = await this.authService.login(body);
    // res.cookie('auth', result.token, { httpOnly: true, sameSite: 'strict' });
    return res.json(result);
  }

  /**
   * Registers a new user.
   * @returns A Promise that resolves to the result of the registration process.
   */
  @Post('register')
  async register() {
    return this.authService.register();
  }

  /**
   * Generates an OTP for the given email address.
   * @param email The email address for which to generate the OTP.
   * @param res The HTTP response object.
   * @returns The generated OTP as a JSON response.
   */
  @Get('generate-otp/:email')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async generateOTP(
    @Param('email') email: GenerateOTPValidatorDTO['EMAIL'],
    @Res() res: Response,
  ) {
    const result = await this.authService.generateOTP(email);
    return res.json(result);
  }

  /**
   * Verifies the OTP and updates the user's password.
   * @param body - The DTO containing the OTP and new password.
   * @param res - The HTTP response object.
   * @returns A Promise that resolves to the result of the verification and password update.
   */
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
