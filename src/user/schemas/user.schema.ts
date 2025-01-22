import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { UserRole } from "../enums/UserRole";


@Schema({ timestamps: true })
export class User extends Document {

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.TALENT
  })
  role: string

  @Prop({ default: false })
  isVerified: boolean

  @Prop()
  verificationToken: string

}


export const UserSchema = SchemaFactory.createForClass(User);