import { Document, Schema as MongooseSchema } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ChallengeStatus } from "../enums/ChallengeStatus";
import { Category } from "../../category/schemas/category.schema";

@Schema({ _id: false })
export class Prize {

  @Prop({ required: true })
  place: string;

  @Prop({ required: true })
  minValue: number;

  @Prop({ required: true })
  maxValue: number;

}

export const PrizeSchema = SchemaFactory.createForClass(Prize);

@Schema({ timestamps: true })
export class Challenge extends Document {

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  tasks: string;

  @Prop({ type: [PrizeSchema], default: [] })
  prizes: Prize[];

  @Prop({
    type: [String],
    required: true
  })
  skillsNeeded: string[]

  @Prop({ required: true })
  juniorityLevel: string

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    enum: Object.values(ChallengeStatus),
    default: ChallengeStatus.OPEN,
    index: true
  })
  status: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category', required: true })
  category: Category;

}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);