import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { AddFeedbackDto, CreateSubmissionDto, UpdateSubmissionStatusDto } from './dto/submission.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../user/enums/UserRole';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubmissionService } from './submission.service';
import { ParseObjectIdPipe } from '../pipes/parse-object-id.pipe';
import { QuerySubmissionsDto } from './dto/query-submissions.dto';

@ApiTags('Submission')
@Controller('submissions')
export class SubmissionController {

  constructor(
    private readonly submissionService: SubmissionService
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new challenge solution submission' })
  async createSubmission(
    @Req() req,
    @Body() createDto: CreateSubmissionDto
  ) {
    return this.submissionService.createSubmission(req.user.id, createDto);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get all submissions (admin only)' })
  async getAllSubmissions(@Query() query: QuerySubmissionsDto) {
    return this.submissionService.getAllSubmissions(query.page, query.limit, query.status);
  }

  @Post(':id/feedback')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Add feedback to a submission' })
  async addFeedback(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() req,
    @Body() feedbackDto: AddFeedbackDto
  ) {
    return this.submissionService.addFeedback(id, req.user.id, feedbackDto);
  }

  @Put(':id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.SUB_ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Update submission status' })
  async updateStatus(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateDto: UpdateSubmissionStatusDto
  ) {
    return this.submissionService.updateStatus(id, updateDto.status);
  }

}