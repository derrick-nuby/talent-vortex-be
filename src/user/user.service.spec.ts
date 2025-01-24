import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { QueryUserDto, SortOrder, UserSortField } from './dto/query-user.dto';
import { UserRole } from './enums/UserRole';

// Mock the encrypt function
jest.mock('../utils/crypto.util', () => ({
  encrypt: jest.fn().mockReturnValue('mock-encrypted-token'),
}));



describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let mailService: MailService;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword',
    verificationToken: 'mock-encrypted-token',
    role: UserRole.TALENT,
  };

  const mockUserModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user and send verification email', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.TALENT,
        email: 'john.doe@example.com',
        password: 'password123',
      };

      // Mock findOne to return no user
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock create to return the new user
      mockUserModel.create.mockResolvedValue(mockUser);

      // Mock sendVerificationEmail
      mockMailService.sendVerificationEmail.mockResolvedValue(true);

      const result = await service.create(createUserDto);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: createUserDto.email });
      expect(mockUserModel.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
        verificationToken: 'mock-encrypted-token',
      });
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        'mock-encrypted-token',
      );
      expect(result).toEqual({
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        email: mockUser.email,
      });
    });

    it('should throw BadRequestException if email is already registered', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.TALENT,
        email: 'john.doe@example.com',
        password: 'password123',
      };

      // Mock findOne to return an existing user
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return a list of users with pagination', async () => {
      const queryDto: QueryUserDto = {
        page: 1,
        limit: 10,
        sortField: UserSortField.CREATED_AT,
        sortOrder: SortOrder.DESC,
      };

      const mockAggregateResult = [
        {
          users: [mockUser],
          totalCount: [{ count: 1 }],
        },
      ];

      // Mock aggregate to return the result
      mockUserModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      });

      const result = await service.findAll(queryDto);

      expect(mockUserModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual({
        users: [mockUser],
        pagination: {
          currentPage: 1,
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      // Mock findById to return the user
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findOne(mockUser._id);

      expect(mockUserModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Mock findById to return null
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(mockUser._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      // Mock findByIdAndUpdate to return the updated user
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updatedUser),
      });

      const result = await service.update(mockUser._id, updateUserDto);

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        updateUserDto,
        { new: true },
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      // Mock findByIdAndUpdate to return null
      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(mockUser._id, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      // Mock findByIdAndDelete to return the user
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.remove(mockUser._id);

      expect(mockUserModel.findByIdAndDelete).toHaveBeenCalledWith(mockUser._id);
    });

    it('should throw NotFoundException if user is not found', async () => {
      // Mock findByIdAndDelete to return null
      mockUserModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(mockUser._id)).rejects.toThrow(NotFoundException);
    });
  });
});