import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  EMAIL = 'email',
  PASSWORD = 'password',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  TIME = 'time',
  FILE = 'file',
  PHONE = 'phone'
}

@Schema({ _id: false })
export class Option {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  value: string;
}

@Schema({ _id: false })
export class Validation {
  @Prop({ required: true })
  type: string;  // required, min, max, pattern, etc.

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;    // The validation value (true for required, number for min/max, etc.)

  @Prop()
  message?: string;  // Custom error message
}

@Schema()
export class Field {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  label: string;

  @Prop({
    type: String,
    enum: Object.values(FieldType),
    required: true
  })
  type: FieldType;

  @Prop({ type: [{ type: Option }] })
  options?: Option[]; // This will only apply for select, multiselect, radio, checkbox

  @Prop({ type: [{ type: Validation }] })
  validations?: Validation[];

  @Prop()
  placeholder?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  defaultValue?: any;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  attributes?: Record<string, any>; //This will contain additional HTML attributes

}


@Schema({ timestamps: true })
export class Form extends Document{

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Field], required: true })
  fields: Field[]

}


export const FormSchema = SchemaFactory.createForClass(Form);