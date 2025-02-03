import { Document, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Challenge } from './challenge.schema';
import { User } from '../../user/schemas/user.schema';
import { ApplicationStatus } from '../enums/ApplicationStatus';

export enum ApplicationType {
  INDIVIDUAL = 'individual',
  TEAM = 'team',
}


export enum TeamMemberStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Schema({ _id: false })
export class TeamMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  email: string;

  @Prop({
    type: String,
    enum: Object.values(TeamMemberStatus),
    default: TeamMemberStatus.PENDING
  })
  status: string;

  @Prop({ default: Date.now })
  invitedAt: Date;

  @Prop()
  respondedAt?: Date;

  @Prop()
  token?: string;

  @Prop()
  tokenExpiresAt?: Date;
}

@Schema({ timestamps: true })
export class Application extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Challenge', required: true, index: true })
  challenge: Challenge;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  applicant: User;

  @Prop({
    type: String,
    enum: Object.values(ApplicationType),
    required: true,
  })
  type: ApplicationType;

  @Prop([TeamMember])
  teamMembers: TeamMember[];

  @Prop({
    type: String,
    enum: Object.values(ApplicationStatus),
    default: ApplicationStatus.PENDING,
    index: true,
  })
  status: ApplicationStatus;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);


ApplicationSchema.index({ applicant: 1, challenge: 1 }, { unique: true });
ApplicationSchema.index({ 'teamMembers.user': 1, challenge: 1 }, { unique: true });