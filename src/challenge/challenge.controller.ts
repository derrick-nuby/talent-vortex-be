import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ChallengeService } from "./challenge.service";
import { Challenge } from "./schemas/challenge.schema";
import { ParseObjectIdPipe } from "../pipes/parse-object-id.pipe";
import UpdateChallengeDto from "./dto/update-challenge.dto";
import { QueryChallengeDto } from "./dto/query.dto";
import { CacheTTL } from "@nestjs/common/cache";

@ApiTags('Challenges')
@Controller('challenges')
export class ChallengeController {

  constructor(
    private readonly challengeService: ChallengeService
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


  @Get(':id')
  @ApiOperation({ summary: 'Get a challenge by ID' })
  async getChallengeById(@Param('id', ParseObjectIdPipe) id: string): Promise<Challenge> {
    return this.challengeService.findById(id);
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

}