import { Document } from "mongoose"
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Category extends Document {

  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

}

export const CategorySchema = SchemaFactory.createForClass(Category);