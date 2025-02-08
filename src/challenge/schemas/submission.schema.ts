import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema , Document} from "mongoose";
import { User } from '../../user/schemas/user.schema';
import { Application } from './application.schema';
import { SubmissionStatus } from '../enums/SubmissionStatus';

@Schema({ _id: false })
export class Link {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  description?: string;
}

const LinkSchema = SchemaFactory.createForClass(Link);


@Schema({ _id: false })
export class Feedback {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reviewer: User;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: false })
  isPrivate: boolean;
}

const FeedbackSchema = SchemaFactory.createForClass(Feedback);


@Schema({ timestamps: true })
export class Submission extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Application', required: true, unique: true })
  application: Application;

  @Prop({ type: [LinkSchema] })
  deployedLinks: Link[];

  @Prop({ type: [LinkSchema] })
  githubLinks: Link[];

  @Prop({ type: [LinkSchema] })
  figmaLinks: Link[];

  @Prop({ type: [LinkSchema] })
  otherLinks: Link[];

  @Prop()
  submitterComments?: string;

  @Prop({
    type: String,
    enum: Object.values(SubmissionStatus),
    default: SubmissionStatus.PENDING_REVIEW
  })
  status: SubmissionStatus;

  @Prop({ type: [FeedbackSchema], default: [] })
  feedback: Feedback[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  submitter: User;

  @Prop({ type: Date })
  lastUpdated: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);

SubmissionSchema.index({ application: 1, status: 1 });
SubmissionSchema.index({ submitter: 1, status: 1 });