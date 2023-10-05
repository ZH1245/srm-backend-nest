// -------------------------------------------------------------------------
import {
  Body,
  Controller,
  ExceptionFilter,
  Get,
  HttpException,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserDTO,
  DisableUserDTO,
  EnableUserDTO,
  NewUserDTO,
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
    return response.json({ users: result, message: 'success' });
  }

  /**
   * Retrieves a list of users who have been created.
   * @returns A Promise that resolves to an array of user objects.
   */
  @Get('created')
  async getCreatedUsers(@Res() response: Response): Promise<any> {
    const result = await this.userService.getCreatedUsers();
    return response.json({ users: result, message: 'success' });
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
  @Get('query')
  async getUserByQueryParams(@Query() query: any, @Res() response: Response) {
    const result = await this.userService.getUserByQueryParams(query);
    return response.json(result);
  }
  @Post('new-user')
  async createNewUser(
    @Body() body: NewUserDTO,
    @Res() response: Response,
  ): Promise<Response<{ message: string }>> {
    console.log(body);
    const result: { message: string } = await this.userService.createNewUser(
      body,
    );
    return response.json({ message: result.message });
  }
  @Put('edit-user')
  async EditUser(
    @Body() body: User & { ROLE: 'user' | 'admin'; CODE: string },
    @Res() response: Response,
  ) {
    const result = await this.userService.EditUser(body);
    return response.json({ message: result.message });
  }
}
