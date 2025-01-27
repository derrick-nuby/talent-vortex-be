import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from './schemas/challenge.schema';
import { Model } from 'mongoose';
import { TimeRange } from './enums/TimeRange';
import { ChallengeStatus } from './enums/ChallengeStatus';
import { AnalyticsResponse, ChallengeOverviewResponse } from './inferfaces/analytics.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache  } from 'cache-manager';

@Injectable()
export default class AnalyticsService {
  constructor(
    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<Challenge>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  private getDateRanges(timeRange: TimeRange = TimeRange.LAST_30_DAYS): { currentStart: Date; currentEnd: Date; previousStart: Date } {
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;

    if (timeRange === TimeRange.THIS_WEEK) {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
    } else { // LAST_30_DAYS
      currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - 30);
      previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 30);
    }

    return { currentStart, currentEnd: now, previousStart };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  private async getAnalytics(
    timeRange: TimeRange = TimeRange.LAST_30_DAYS,
    status?: ChallengeStatus
  ): Promise<AnalyticsResponse> {
    const cacheKey = `challenge_analytics_${timeRange}_${status || 'total'}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as AnalyticsResponse;

    const { currentStart, currentEnd, previousStart } = this.getDateRanges(timeRange);

    const matchStage = status
      ? { status, createdAt: { $exists: true } }
      : { createdAt: { $exists: true } };

    const results = await this.challengeModel.aggregate([
      {
        $facet: {
          current: [
            {
              $match: {
                ...matchStage,
                createdAt: { $gte: currentStart, $lte: currentEnd }
              }
            },
            { $count: 'count' }
          ],
          previous: [
            {
              $match: {
                ...matchStage,
                createdAt: { $gte: previousStart, $lt: currentStart }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    const current = results[0].current[0]?.count || 0;
    const previous = results[0].previous[0]?.count || 0;
    const percentageChange = this.calculatePercentageChange(current, previous);

    const response = { current, previous, percentageChange, timeRange };
    await this.cacheManager.set(cacheKey, response, 300); // Cache for 5 minutes

    return response;
  }


  async getTotalChallenges(timeRange?: TimeRange): Promise<AnalyticsResponse> {
    return this.getAnalytics(timeRange);
  }

  async getOpenChallenges(timeRange?: TimeRange): Promise<AnalyticsResponse> {
    return this.getAnalytics(timeRange, ChallengeStatus.OPEN);
  }

  async getOngoingChallenges(timeRange?: TimeRange): Promise<AnalyticsResponse> {
    return this.getAnalytics(timeRange, ChallengeStatus.ONGOING);
  }

  async getCompletedChallenges(timeRange?: TimeRange): Promise<AnalyticsResponse> {
    return this.getAnalytics(timeRange, ChallengeStatus.COMPLETED);
  }

  async getStatusOverview(): Promise<ChallengeOverviewResponse> {
    const cacheKey = 'challenge_status_overview';
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached as ChallengeOverviewResponse;

    const results = await this.challengeModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).exec();


    const overview: ChallengeOverviewResponse = {
      analytics: {
        completed: { count: 0 },
        open: { count: 0 },
        ongoing: { count: 0 }
      }
    };

    results.forEach(result => {
      const status = result._id.toLowerCase();
      if (status in overview.analytics) {
        overview.analytics[status].count = result.count;
      }
    });

    await this.cacheManager.set(cacheKey, overview, 300); // Cache for 5 minutes
    return overview;
  }

}