// -------------------------------------------------------------------------
import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GrpoService } from './grpo.service';
import { UserDashboard } from 'src/dashboard/dashboard.controller';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import {
  CreateMyGRPOValidatorDTO,
  MyCompletedGRPOSByID,
  MyReadyGRPOSByID,
} from './validators';
// -------------------------------------------------------------------------

@Controller('grpo')
/**
 * Controller for handling GRPO (Goods Receipt PO) related requests.
 */
export class GrpoController {
  /**
   * Constructor for GrpoController.
   * @param grpoService - Instance of GrpoService.
   */
  constructor(private readonly grpoService: GrpoService) {}

  /**
   * Endpoint for getting pending GRPOs of the authenticated user.
   * @param req - Express Request object with user information.
   * @param res - Express Response object.
   * @returns JSON response with fetched data.
   */
  @Get('my-pending-grpos')
  async getMyPendingGrpos(
    @Req() req: Request & { user?: string | JwtPayload },
    @Res() res: Response,
  ) {
    const result = await this.grpoService.getMyPendingGrpos(req.user);
    return res.json({ data: result, message: 'Fetched' });
  }

  /**
   * Endpoint for getting completed GRPOs of the authenticated user.
   * @param req - Express Request object with user information.
   * @param res - Express Response object.
   * @returns JSON response with fetched data and message.
   */
  @Get('my-completed-grpos')
  async getMyCompletedGrpos(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
  ) {
    const result = await this.grpoService.getMyCompletedGrpos(req.user);
    return res.json({ data: result.data, message: result.message });
  }

  /**
   * Endpoint for getting ready GRPOs of the authenticated user.
   * @param req - Express Request object with user information.
   * @returns Promise with ready GRPOs data.
   */
  @Get('my-ready-grpos')
  async getMyReadyGrpos(@Req() req: { user?: UserDashboard }) {
    const user = req.user;
    return this.grpoService.getMyReadyGrpos(user);
  }

  /**
   * Endpoint for getting ready GRPOs of the authenticated user by document entry ID.
   * @param req - Express Request object with user information.
   * @param id - Document entry ID.
   * @returns Promise with ready GRPOs data or throws HttpException.
   */
  @Get('my-ready-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyReadyGrposByDocEntry(
    @Req() req: { user?: UserDashboard },
    @Param('id') id: MyReadyGRPOSByID['id'],
  ) {
    const user = req.user;
    if (id) {
      return this.grpoService.getMyReadyGrposByDocEntry(user, id);
    } else {
      throw new HttpException('Invalid DocEntry', 400);
    }
  }

  /**
   * Endpoint for getting completed GRPOs of the authenticated user by document entry ID.
   * @param req - Express Request object with user information.
   * @param id - Document entry ID.
   * @returns Promise with completed GRPOs data or throws HttpException.
   */
  @Get('my-completed-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getMyCompletedGrposByDocEntry(
    @Req() req: { user?: UserDashboard },
    @Param('id') id: MyCompletedGRPOSByID['id'],
  ) {
    const user = req.user;

    if (id) {
      return this.grpoService.getMyCompletedGrposByDocEntry(user, id);
    } else {
      throw new HttpException('Invalid DocEntry', 400);
    }
  }

  /**
   * Endpoint for creating a new GRPO for the authenticated user.
   * @param files - Array of uploaded files.
   * @param body - Request body with GRPO data.
   * @param req - Express Request object with user information.
   * @returns Promise with created GRPO data.
   */
  @Post('create-my-grpo')
  @UseInterceptors(AnyFilesInterceptor())
  async createMyGrpo(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateMyGRPOValidatorDTO,
    @Req() req: Request & { user?: UserDashboard },
  ) {
    const user = req.user;
    const result = await this.grpoService.createMyGrpo(user, files, body);
    return result;
  }

  /**
   * Endpoint for marking a GRPO as ready.
   * @returns Promise with marked GRPO data.
   */
  @Patch('mark-grpo-as-ready')
  async markGrpoAsReady() {
    return this.grpoService.markGrpoAsReady();
  }

  /**
   * Endpoint for marking a GRPO as completed.
   * @returns Promise with marked GRPO data.
   */
  @Patch('mark-grpo-as-completed')
  async markGrpoAsCompleted() {
    return this.grpoService.markGrpoAsCompleted();
  }

  /**
   * Endpoint for downloading attachment of a completed GRPO by document entry ID.
   * @param id - Document entry ID.
   * @param res - Express Response object.
   * @returns Promise with attachment data or throws HttpException.
   */
  @Get('download-attachment/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async downloadAttachment(
    @Param('id') id: MyCompletedGRPOSByID['id'],
    @Res() res: Response,
  ) {
    const result: { data: any; ATTACHMENTNAME: string } =
      await this.grpoService.downloadAttachment(id);
    if (result) {
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${result.ATTACHMENTNAME}`,
      );
      return res.send(result.data);
    } else {
      throw new HttpException('Invalid Attachment', 400);
    }
  }

  /**
   * Endpoint for getting all invoices from GRPOs of the authenticated user.
   * @param req - Express Request object with user information.
   * @param res - Express Response object.
   * @returns JSON response with fetched data and message.
   */
  @Get('all-invoices-grpos')
  async getAllInvoicesFromGrpos(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
  ) {
    const user = req.user;
    const result = await this.grpoService.getAllInvoicesFromGrpos(user);
    return res.json({ data: result.data, message: result.message });
  }

  /**
   * Endpoint for getting invoice details of a completed GRPO by document entry ID.
   * @param req - Express Request object with user information.
   * @param res - Express Response object.
   * @param id - Document entry ID.
   * @returns JSON response with fetched data and message.
   */
  @Get('all-invoices-grpos/:id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getInvoiceDetails(
    @Req() req: { user?: UserDashboard },
    @Res() res: Response,
    @Param('id') id: MyCompletedGRPOSByID['id'],
  ) {
    const user = req.user;
    const result = await this.grpoService.getInvoiceDetails(user, id);
    return res.json({ data: result.data, message: result.message });
  }
}
