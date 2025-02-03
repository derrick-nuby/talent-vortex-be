import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChallengeService } from './challenge.service';
import { Challenge } from './schemas/challenge.schema';
import { ParseObjectIdPipe } from '../pipes/parse-object-id.pipe';
import UpdateChallengeDto from './dto/update-challenge.dto';
import { QueryChallengeDto } from './dto/query.dto';
import { CacheTTL } from '@nestjs/common/cache';
import { ApplyChallengeDto } from './dto/apply-challenge.dto';
import { ApplicationService } from './services/application.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { QueryParticipantsDto } from './dto/query-participants.dto';

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengeController {

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly applicationService: ApplicationService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new challenge' })
  async createChallenge(@Body() challengeDto: CreateChallengeDto): Promise<Challenge> {
    return this.challengeService.create(challengeDto);
  }

  @Get()
  @CacheTTL(300)
  @ApiOperation({ summary: 'Get paginated challenges' })
  async findAll(@Query() queryDto: QueryChallengeDto) {
    const result = await this.challengeService.findAll(queryDto);

    return {
      message: 'Challenges retrieved successfully',
      ...result
    };
  }


  @Get(':identifier')
  @ApiOperation({ summary: 'Get a challenge by ID or slug' })
  async getChallengeById(@Param('identifier') identifier: string): Promise<Challenge> {
    return this.challengeService.findByIdentifier(identifier);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing challenge' })
  async updateChallenge(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateDto: UpdateChallengeDto
  ): Promise<Challenge> {
    return this.challengeService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a challenge' })
  async deleteChallenge(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.challengeService.delete(id);
  }

  @Post(':id/apply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply to a challenge - for individuals and teams' })
  async applyToChallenge(
    @Body() applyDto: ApplyChallengeDto,
    @Req() req,
    @Param('id', ParseObjectIdPipe) challengeId: string
  ) {
    const { id  } = req.user
    return this.applicationService.applyToChallenge(id, challengeId, applyDto);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Get paginated list of challenge participants' })
  async getChallengeParticipants(
    @Param('id', ParseObjectIdPipe) challengeId: string,
    @Query() queryDto: QueryParticipantsDto
  ) {
    return this.applicationService.getChallengeParticipants(challengeId, queryDto);
  }

}