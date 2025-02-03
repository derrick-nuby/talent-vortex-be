export interface Participant {
  firstName: string;
  lastName: string;
  email: string;
  role: 'TEAM_LEADER' | 'TEAM_MEMBER';
}