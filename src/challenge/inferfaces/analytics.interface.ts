import { TimeRange } from '../enums/TimeRange';

export interface AnalyticsResponse {
  current: number;
  previous: number;
  percentageChange: number;
  timeRange: TimeRange;
}


export interface ChallengeStatusCounts {
  count: number;
}

export interface ChallengeOverviewResponse {
  analytics: {
    completed: ChallengeStatusCounts;
    open: ChallengeStatusCounts;
    ongoing: ChallengeStatusCounts;
  };
}