import { BadRequestException, Controller, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationService } from './services/application.service';

@Controller('team-invitations')
@ApiTags('Team Invitations')
export class TeamInvitationController {

  constructor(
    private readonly applicationService: ApplicationService
  ) {
  }

  @Post(':token/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept team invitation' })
  async acceptInvitation(@Param('token') token: string) {
    try {
      await this.applicationService.handleInvitationResponse(token, true);
      return { message: 'Invitation accepted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Invitation not found');
      }
      throw new BadRequestException(error.message || 'Invalid or expired invitation');
    }
  }

  @Post(':token/reject')
  @ApiOperation({ summary: 'Reject team invitation' })
  async rejectInvitation(@Param('token') token: string) {
    try {
      await this.applicationService.handleInvitationResponse(token, false);
      return { message: 'Invitation rejected successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Invitation not found');
      }
      throw new BadRequestException(error.message || 'Invalid or expired invitation');
    }
  }

}