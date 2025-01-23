import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "../user/schemas/user.schema";
import { Model } from "mongoose";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "./dto/register.dto";
import { v4 as uuidV4 } from "uuid";
import { MailService } from "../mail/mail.service";
import { decrypt, encrypt } from "../utils/crypto.util";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}

  async login (loginDto: LoginDto) {

    const existingUser = await this.userModel.findOne({ email: loginDto.email }).exec();
    if(!existingUser) {
      throw new NotFoundException(`User with email ${loginDto.email} not found`);
    }

    if(!existingUser.isVerified) {
      throw new BadRequestException(`Email ${existingUser.email} is not verified`);
    }

    const passwordMatch = await bcrypt.compare(loginDto.password, existingUser.password);
    if(!passwordMatch) {
      throw new BadRequestException(' Invalid credentials ');
    }

    const payload = {
      role: existingUser.role,
      sub: existingUser.id
    }

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        role: existingUser.role
      }
    }

  }

  async verifyEmail (token: string) {

    const decryptedToken = decrypt(token);

    const user = await this.userModel.findOne({verificationToken: decryptedToken}).exec();
    if(!user) {
      throw new BadRequestException('Invalid token')
    }

    user.isVerified = true;
    user.verificationToken = null;

    await user.save();

    return {
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };

  }

  async register (registerDto: RegisterDto) {
    const existingUser = await this.userModel.findOne({email: registerDto.email}).exec();

    if(existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    try{

      const verificationToken = uuidV4();
      const encryptedToken = encrypt(verificationToken);

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
      const user = await this.userModel.create({
        ...registerDto,
        password: hashedPassword,
        verificationToken
      });

      await this.mailService.sendVerificationEmail(
        user.email,
        user.firstName,
        encryptedToken
      );

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

    }catch (error) {
      throw new BadRequestException(`${error.message}`)
    }

  }

}
