import { Controller, Get, Query } from '@nestjs/common';
import AnalyticsService from './analytics.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { AnalyticsResponse, ChallengeOverviewResponse } from './inferfaces/analytics.interface';

@ApiTags('Challenge Analytics')
@Controller({
  version: '1',
  path: 'analytics'
})
export class AnalyticsController {

  constructor(
    private readonly analyticsService: AnalyticsService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get overview of challenges by status' })
  async getOverview(): Promise<ChallengeOverviewResponse> {
    return this.analyticsService.getStatusOverview();
  }

  @Get('total')
  @ApiOperation({ summary: 'Get total challenges analytics' })
  async getTotalChallenges(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponse> {
    return this.analyticsService.getTotalChallenges(query.timeRange);
  }

  @Get('open')
  @ApiOperation({ summary: 'Get open challenges analytics' })
  async getOpenChallenges(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponse> {
    return this.analyticsService.getOpenChallenges(query.timeRange);
  }

  @Get('ongoing')
  @ApiOperation({ summary: 'Get ongoing challenges analytics' })
  async getOngoingChallenges(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponse> {
    return this.analyticsService.getOngoingChallenges(query.timeRange);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed challenges analytics' })
  async getCompletedChallenges(@Query() query: AnalyticsQueryDto): Promise<AnalyticsResponse> {
    return this.analyticsService.getCompletedChallenges(query.timeRange);
  }


}