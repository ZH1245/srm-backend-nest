// -------------------------------------------------------------------------
import {
  Body,
  Controller,
  ExceptionFilter,
  Get,
  HttpException,
  Patch,
  Res,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserDTO,
  DisableUserDTO,
  EnableUserDTO,
  User,
  VerfityEmailDTO,
  getNotCreatedUsersResult,
} from './type';
import { Response } from 'express';
import { Result } from 'odbc';
import { HttpExceptionFilter } from 'src/http-exception-filter';
// -------------------------------------------------------------------------
/**
 * @class UserController
 */
@Controller('user')
@UseFilters(HttpExceptionFilter)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Retrieves a list of users who have not been created yet.
   * @returns A Promise that resolves to an array of user objects.
   */
  @Get('not-created')
  async getNotCreatedUsers(@Res() response: Response): Promise<any> {
    const result = await this.userService.getNotCreatedUsers();
    return response.json(result);
  }

  /**
   * Retrieves a list of users who have been created.
   * @returns A Promise that resolves to an array of user objects.
   */
  @Get('created')
  async getCreatedUsers(): Promise<any> {
    return this.userService.getCreatedUsers();
  }

  /**
   * Verifies the email of a user.
   * @returns A Promise that resolves to a boolean indicating whether the email was verified successfully.
   */
  @Patch('verify-email')
  async verifyEmail(
    @Body() body: VerfityEmailDTO,
  ): Promise<{ message: string }> {
    return this.userService.verifyEmail(body);
  }

  /**
   * Disables a user.
   * @returns A Promise that resolves to a boolean indicating whether the user was disabled successfully.
   */
  @Patch('disable-user')
  async disableUser(
    @Body() body: DisableUserDTO,
  ): Promise<{ message: string }> {
    return this.userService.disableUser(body);
  }

  /**
   * Enables a user.
   * @returns A Promise that resolves to a boolean indicating whether the user was enabled successfully.
   */
  @Patch('enable-user')
  async enableUser(@Body() body: EnableUserDTO): Promise<{ message: string }> {
    return this.userService.enableUser(body);
  }

  /**
   * Deletes a user.
   * @returns A Promise that resolves to a boolean indicating whether the user was deleted successfully.
   */
  @Patch('delete-user')
  async deleteUser(@Body() body: DeleteUserDTO): Promise<{ message: string }> {
    return this.userService.deleteUser(body);
  }
}
