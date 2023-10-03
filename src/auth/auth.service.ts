import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login() {
    return 'login';
  }
  async register() {
    return 'register';
  }
  async generateOTP() {
    return 'generate-otp';
  }
  async verifyOTPAndUpdatePassword() {
    return 'verify-otp-password';
  }
}
