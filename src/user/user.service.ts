import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { v4 as uuidV4 } from "uuid";
import { MailService } from "../mail/mail.service";
import { encrypt } from "../utils/crypto.util";

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mailService: MailService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    const verificationToken = uuidV4();
    const encryptedToken = encrypt(verificationToken);

    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const user = await this.userModel.create({
        ...createUserDto,
        password: hashedPassword,
        verificationToken,
      });

      await this.mailService.sendVerificationEmail
      (user.email,
        user.firstName,
        encryptedToken
      );

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

    }catch (error) {
      throw new BadRequestException(`${error.message}`);
    }

  }

  async findAll():Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

}
