import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Challenge } from "./schemas/challenge.schema";
import { Model, PipelineStage, Types } from 'mongoose';
import { CreateChallengeDto } from "./dto/create-challenge.dto";
import UpdateChallengeDto from "./dto/update-challenge.dto";
import { QueryChallengeDto } from "./dto/query.dto";
import { Category } from '../category/schemas/category.schema';
import { generateSlug } from '../utils';

@Injectable()
export class ChallengeService {
  @InjectModel(Challenge.name)
  private readonly challengeModel: Model<Challenge>
  @InjectModel(Category.name)
  private readonly categoryModel: Model<Category>

  async create(challengeDto: CreateChallengeDto): Promise<Challenge> {

    if (!Types.ObjectId.isValid(challengeDto.category)) {
      throw new BadRequestException(`Invalid category ID: ${challengeDto.category}`);
    }

    const category = await this.categoryModel.findById(challengeDto.category).exec();
    if(!category) {
      throw new NotFoundException(`Category with id ${challengeDto.category} is not available`);
    }

    const slug = generateSlug(challengeDto.title);

    const challenge = new this.challengeModel({
      ...challengeDto,
      slug,
      category: challengeDto.category,
    });

    return challenge.save();

  }


  async findAll(queryDto: QueryChallengeDto) {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortField = 'createdAt',
      sortOrder = 'desc'
    } = queryDto;

    const query: Record<string, any> = {};

    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    if (status) {
      query.status = status;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const pipeline: PipelineStage[] = [
      { $match: query },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      { $unwind: '$categoryDetails' },
      { $sort: { [sortField]: sortDirection } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $facet: {
          challenges: [
            {
              $project: {
                slug: 1,
                title: 1,
                description: 1,
                email: 1,
                tasks: 1,
                prizes: 1,
                skillsNeeded: 1,
                juniorityLevel: 1,
                startDate: 1,
                endDate: 1,
                status: 1,
                category: {
                  id: '$categoryDetails._id',
                  name: '$categoryDetails.name',
                  slug: '$categoryDetails.slug',
                },
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.challengeModel.aggregate(pipeline).exec();

    const challenges = result.challenges;
    const totalChallenges = result.totalCount[0]?.count || 0;

    return {
      challenges,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalChallenges,
        totalPages: Math.ceil(totalChallenges / limit)
      }
    };
  }

  async findById(id: string): Promise<Challenge> {
    try {
      const challenge = await this.challengeModel
        .findById(id)
        .populate('category')
        .exec();

      if (!challenge) {
        throw new NotFoundException(`Challenge with ID ${id} not found`);
      }

      return challenge;
    } catch (error) {
      throw new Error(`Error finding challenge: ${error.message}`);
    }
  }

  async update(id: string, updateDto: UpdateChallengeDto): Promise<Challenge> {
    try {
      const updatedChallenge = await this.challengeModel
        .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
        .populate('category')
        .exec();

      if (!updatedChallenge) {
        throw new NotFoundException(`Challenge with ID ${id} not found`);
      }

      return updatedChallenge;
    } catch (error) {
      throw new Error(`Failed to update challenge: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.challengeModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException(`Challenge with ID ${id} not found`);
      }
    } catch (error) {
      throw new Error(`Failed to delete challenge: ${error.message}`);
    }
  }

}