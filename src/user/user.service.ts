import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model, PipelineStage } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidV4 } from 'uuid';
import { MailService } from '../mail/mail.service';
import { decrypt, encrypt } from '../utils/crypto.util';
import { QueryUserDto, SortOrder, UserSortField } from './dto/query-user.dto';

@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mailService: MailService
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      if (existingUser) {
        throw new BadRequestException('Email is already registered');
      }

      const passwordCreationToken = uuidV4();
      const passwordCreationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); //24 hours

      const user = await this.userModel.create({
        ...createUserDto,
        passwordCreationToken,
        passwordCreationTokenExpires,
      });

      const encryptedToken = encrypt(passwordCreationToken);

      await this.mailService.sendPasswordCreatingEmail(
        user.email,
        user.firstName + user.lastName,
        encryptedToken,
      );

      return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };

    } catch (error) {
      throw new BadRequestException(`${error.message}`);
    }
  }

  async createPassword(token: string, password: string) {

    const decryptedToken = decrypt(token);

    const user = await this.userModel.findOne({
      passwordCreationToken: decryptedToken,
      passwordCreationTokenExpires: { $gt: new Date() },
    }).exec();

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(password, saltRounds);
    user.passwordCreationToken = undefined;
    user.passwordCreationTokenExpires = undefined;
    user.isVerified = true;
    await user.save();

    return { message: 'Password created successfully' };
  }

  async findAll(queryDto: QueryUserDto) {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      sortField = UserSortField.CREATED_AT,
      sortOrder = SortOrder.DESC
    } = queryDto;

    const query: Record<string, any> = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: `^${search}`, $options: 'i' } },
        { lastName: { $regex: `^${search}`, $options: 'i' } },
        { email: { $regex: `^${search}`, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    const pipeline: PipelineStage[] = [
      { $match: query },
      { $sort: { [sortField]: sortOrder === SortOrder.ASC ? 1 : -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { password: 0 } },
      {
        $facet: {
          users: [],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const [result] = await this.userModel.aggregate(pipeline).exec();

    const users = result.users;
    const totalUsers = result.totalCount[0]?.count || 0;

    return {
      users,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    };
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
