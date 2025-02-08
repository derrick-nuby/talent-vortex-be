import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Submission } from './schemas/submission.schema';
import { Model, PipelineStage } from 'mongoose';
import { Application, ApplicationType } from './schemas/application.schema';
import { AddFeedbackDto, CreateSubmissionDto } from './dto/submission.dto';
import { SubmissionStatus } from './enums/SubmissionStatus';
import { UserService } from '../user/user.service';

@Injectable()
export class SubmissionService {

  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(Application.name)
    private readonly applicationModel: Model<Application>,
    private readonly userService: UserService,

  ) {}

  async createSubmission(userId: string, createDto: CreateSubmissionDto): Promise<Submission> {
    const application = await this.applicationModel
      .findById(createDto.applicationId)
      .populate('applicant')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }


    if (
      application.type === ApplicationType.INDIVIDUAL &&
      application.applicant.id !== userId
    ) {
      throw new BadRequestException('Not authorized to submit for this application');
    }

    if (
      application.type === ApplicationType.TEAM &&
      application.applicant.id !== userId
    ) {
      throw new BadRequestException('Only team leader can submit solutions');
    }

    const existingSubmission = await this.submissionModel
      .findOne({ application: application._id })
      .exec();

    if (existingSubmission) {
      throw new BadRequestException('Submission already exists for this application');
    }

    const submission = new this.submissionModel({
      ...createDto,
      application: application._id,
      submitter: userId,
      lastUpdated: new Date(),
    });

    return submission.save();
  }


  async addFeedback(submissionId: string, userId: string, feedbackDto: AddFeedbackDto) {
    const submission = await this.submissionModel.findById(submissionId).exec();
    const user = await this.userService.findOne(userId);

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.feedback.push({
      reviewer: user,
      isPrivate: feedbackDto.isPrivate ?? false,
      ...feedbackDto,
      createdAt: new Date(),
    });

    submission.lastUpdated = new Date();
    return submission.save();
  }

  async updateStatus(submissionId: string, status: SubmissionStatus): Promise<Submission> {
    const submission = await this.submissionModel.findById(submissionId).exec();

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    submission.status = status;
    submission.lastUpdated = new Date();
    return submission.save();
  }


  async getSubmissionsByUser(userId: string, page = 1, limit = 10) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          submitter: userId,
        },
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'applicationDetails',
        },
      },
      {
        $unwind: '$applicationDetails',
      },
      {
        $lookup: {
          from: 'challenges',
          localField: 'applicationDetails.challenge',
          foreignField: '_id',
          as: 'challengeDetails',
        },
      },
      {
        $unwind: '$challengeDetails',
      },
      {
        $facet: {
          submissions: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                status: 1,
                deployedLinks: 1,
                githubLinks: 1,
                figmaLinks: 1,
                otherLinks: 1,
                submitterComments: 1,
                feedback: {
                  $filter: {
                    input: '$feedback',
                    as: 'fb',
                    cond: { $eq: ['$$fb.isPrivate', false] },
                  },
                },
                challenge: {
                  title: '$challengeDetails.title',
                  slug: '$challengeDetails.slug',
                },
                createdAt: 1,
                lastUpdated: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.submissionModel.aggregate(pipeline).exec();

    return {
      submissions: result.submissions,
      total: result.totalCount[0]?.count || 0,
      page,
      pages: Math.ceil((result.totalCount[0]?.count || 0) / limit),
    };
  }

  async getAllSubmissions(page = 1, limit = 10, status?: SubmissionStatus) {
    const pipeline: PipelineStage[] = [
      ...(status ? [{ $match: { status } }] : []),
      {
        $lookup: {
          from: 'applications',
          localField: 'application',
          foreignField: '_id',
          as: 'applicationDetails',
        },
      },
      {
        $unwind: '$applicationDetails',
      },
      {
        $lookup: {
          from: 'challenges',
          localField: 'applicationDetails.challenge',
          foreignField: '_id',
          as: 'challengeDetails',
        },
      },
      {
        $unwind: '$challengeDetails',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'submitter',
          foreignField: '_id',
          as: 'submitterDetails',
        },
      },
      {
        $unwind: '$submitterDetails',
      },
      {
        $facet: {
          submissions: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                status: 1,
                deployedLinks: 1,
                githubLinks: 1,
                figmaLinks: 1,
                otherLinks: 1,
                submitterComments: 1,
                feedback: 1,
                challenge: {
                  title: '$challengeDetails.title',
                  slug: '$challengeDetails.slug',
                },
                submitter: {
                  firstName: '$submitterDetails.firstName',
                  lastName: '$submitterDetails.lastName',
                  email: '$submitterDetails.email',
                },
                createdAt: 1,
                lastUpdated: 1,
              },
            },
          ],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await this.submissionModel.aggregate(pipeline).exec();

    return {
      submissions: result.submissions,
      total: result.totalCount[0]?.count || 0,
      page,
      pages: Math.ceil((result.totalCount[0]?.count || 0) / limit),
    };
  }

}