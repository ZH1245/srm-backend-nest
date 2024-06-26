// -------------------------------------------------------------------------
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  DeleteUserDTO,
  DisableUserDTO,
  EnableUserDTO,
  VerfityEmailDTO,
} from './type';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from 'src/http-exception-filter';
import {
  CreateUserValidatorDTO,
  EditUserValidatorDTO,
  UpdateUserValidatorDTO,
} from './validators';
import { MyCompletedGRPOSByID } from 'src/grpo/validators';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
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
  async getCreatedUsers(
    @Res() response: Response,
    @Req() req: Request & { user: UserDashboard },
  ): Promise<any> {
    const result = await this.userService.getCreatedUsers(req.user);
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
    @Res() res: Response,
  ): Promise<Response<{ message: string }>> {
    const result = await this.userService.disableUser(body);
    return res.json({ message: result.message });
  }

  /**
   * Enables a user.
   * @returns A Promise that resolves to a boolean indicating whether the user was enabled successfully.
   */
  @Patch('enable-user')
  async enableUser(
    @Body() body: EnableUserDTO,
    @Res() res: Response,
  ): Promise<Response<{ message: string; data: boolean }>> {
    const result = await this.userService.enableUser(body);
    return res.json({ message: result.message });
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
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createNewUser(
    @Body() body: CreateUserValidatorDTO,
    @Res() response: Response,
  ): Promise<Response<{ message: string }>> {
    console.log(body);
    const result: { message: string } = await this.userService.createNewUser(
      body,
    );
    return response.json({ message: result.message });
  }
  @Put('edit-user')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async EditUser(
    @Body() body: EditUserValidatorDTO,
    @Res() response: Response,
  ) {
    const result = await this.userService.EditUser(body);
    return response.json({ message: result.message });
  }
  @Get('me/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMe(
    @Param('id') id: MyCompletedGRPOSByID['id'],
    @Res() response: Response,
  ) {
    const result = await this.userService.getMyDetails(id);
    return response.json({
      data: result,
      message: 'Profile fetched successfully',
    });
  }
  @Put('update-user')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUser(
    @Body()
    body: UpdateUserValidatorDTO,
    @Res() response: Response,
  ) {
    const result = await this.userService.updateUser(body);
    return response.json({ message: result.message });
  }
}
