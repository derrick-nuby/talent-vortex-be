import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Form } from './schemas/form.schema';
import { Model } from 'mongoose';
import { CreateFormDto } from './dto/create-form.dto';

@Injectable()
export class FormService {
  
  @InjectModel(Form.name)
  private readonly formModel: Model<Form>

  async create(formDto: CreateFormDto): Promise<Form> {
    const createdForm = new this.formModel(formDto);
    return createdForm.save();
  }

  async findOne(id: string): Promise<Form> {
    const form = await this.formModel.findById(id).exec();
    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
    return form;
  }

  async remove(id: string): Promise<void> {
    const result = await this.formModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }
  }

  async findByTitle(title: string): Promise<Form[]> {
    return this.formModel.find({ title: new RegExp(title, 'i') }).exec();
  }

}
