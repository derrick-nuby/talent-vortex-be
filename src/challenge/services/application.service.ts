import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeService } from '../challenge.service';
import { User } from '../../user/schemas/user.schema';
import { ApplyChallengeDto } from '../dto/apply-challenge.dto';
import { Application, ApplicationType, TeamMember } from '../schemas/application.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from '../schemas/challenge.schema';
import { Model, Types } from 'mongoose';
import { ChallengeStatus } from '../enums/ChallengeStatus';
import { ApplicationStatus } from '../enums/ApplicationStatus';
import { UserService } from '../../user/user.service';
import { TeamMemberStatus } from '../enums/TeamMemberStatus';
import { ChallengeType } from '../enums/ChallengeType';
import { v4 as uuidV4 } from 'uuid';
import { MailService } from '../../mail/mail.service';
import { QueryParticipantsDto } from '../dto/query-participants.dto';
import { Participant } from '../inferfaces/participant.interface';


@Injectable()
export class ApplicationService {
  constructor(
  private readonly challengeService: ChallengeService,
  private readonly userService: UserService,
  private readonly mailService: MailService,
  @InjectModel(Challenge.name)
  private readonly challengeModel: Model<Challenge>,
  @InjectModel(Application.name) private applicationModel: Model<Application>,
  ) {}


  async applyToChallenge(userId: string,challengeId: string, createDto: ApplyChallengeDto): Promise<Application> {
    const challenge = await this.challengeModel.findById(challengeId).exec();

    const user = await this.userService.findOne(userId);

    if (!challenge) {
      throw new NotFoundException(`Challenge with id ${challengeId} not found`);
    }

    if (challenge.status !== ChallengeStatus.OPEN) {
      throw new BadRequestException('Challenge is not open for applications');
    }

    const existingApplication = await this.applicationModel.findOne({
      challenge: challenge._id,
      $or: [
        { applicant: user._id },
        { 'teamMembers.user': user._id }
      ]
    }).exec();

    if (existingApplication) {
      throw new BadRequestException('You already have an application for this challenge');
    }

    if (challenge.type === ChallengeType.INDIVIDUAL) {
      return this.createIndividualApplication(user, challenge);
    }

    return this.createTeamApplication(user, challenge, createDto.teamMembers);

  }


  private async createIndividualApplication(user: User, challenge: Challenge) {
    const application = new this.applicationModel({
      challenge: challenge._id,
      applicant: user._id,
      type: ApplicationType.INDIVIDUAL,
      status: ApplicationStatus.ACCEPTED,
    });

    return application.save();
  }

  private async createTeamApplication(
    user: User,
    challenge: Challenge,
    emails: string[]
  ) {

    if(!emails) {
      throw new BadRequestException('Team members emails are required')
    }

    if (!challenge.teamSize || emails.length + 1 !== challenge.teamSize) {
      throw new BadRequestException(
        `Team size must be exactly ${challenge.teamSize} members`
      );
    }

    // Finding users by emails
    const teamMembers = await this.userService.findByEmails(emails);
    const foundEmails = teamMembers.map(m => m.email);
    const missingEmails = emails.filter(e => !foundEmails.includes(e));

    if (missingEmails.length > 0) {
      throw new BadRequestException(
        `The following users are not registered or verified: ${missingEmails.join(', ')}`
      );
    }

    if (teamMembers.some(member => member.id === user.id)) {
      throw new BadRequestException('Cannot add yourself as a team member');
    }

    const existingApplications = await this.applicationModel.find({
      challenge: challenge._id,
      $or: [
        { applicant: { $in: teamMembers.map(m => m._id) } },
        { 'teamMembers.user': { $in: teamMembers.map(m => m._id) } }
      ]
    }).exec();

    if (existingApplications.length > 0) {
      throw new BadRequestException('Some team members are already part of another team');
    }

    const teamMembersData = teamMembers.map(member => ({
      user: member._id,
      email: member.email,
      status: TeamMemberStatus.PENDING,
      token: uuidV4(),
      tokenExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      invitedAt: new Date()
    }));

    const application = new this.applicationModel({
      challenge: challenge._id,
      applicant: user._id,
      type: ApplicationType.TEAM,
      status: ApplicationStatus.PENDING,
      teamMembers: teamMembersData
    });

    const createdApplication = await application.save();

    await Promise.all(
      teamMembersData.map(member =>
        this.mailService.sendTeamInvitationEmail(member.email, member.token, 48)
      )
    )

    return createdApplication;

  }


  private async checkApplicationStatus(application: Application): Promise<void> {
    const allAccepted = application.teamMembers.every(
      member => member.status === TeamMemberStatus.ACCEPTED
    );

    if (allAccepted) {
      application.status = ApplicationStatus.ACCEPTED;
      await application.save();

      await this.mailService.sendApprovalEmail(
        application.applicant.email,
        application.challenge.title
      );
    }
  }

  private async handleApplicationRejection(application: Application, teamMember: TeamMember): Promise<void> {

    await this.mailService.sendRejectionEmail(
      application.applicant.email,
      application.challenge.title,
      `A team member ${teamMember.email} has declined the invitation`
    )

    await application.deleteOne();

  }

  async handleInvitationResponse(token: string, accept: boolean): Promise<void> {
    const application = await this.applicationModel.findOne({
      'teamMembers.token': token,
      'teamMembers.tokenExpiresAt': { $gt: new Date() }
    }).populate('applicant').exec();

    if (!application) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    const teamMember = application.teamMembers.find(tm => tm.token === token);

    if (teamMember.status !== TeamMemberStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    teamMember.status = accept ? TeamMemberStatus.ACCEPTED : TeamMemberStatus.REJECTED;
    teamMember.respondedAt = new Date();
    teamMember.token = undefined;
    teamMember.tokenExpiresAt = undefined;

    if (!accept) {

      await this.handleApplicationRejection(application, teamMember);
      return;
    }

    await application.save();
    await this.checkApplicationStatus(application);
  }

  async getChallengeParticipants(
    challengeId: string,
    queryDto: QueryParticipantsDto
  ): Promise<{ data: Participant[], total: number, page: number, pages: number }> {
    const { page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const aggregationPipeline = [
      // Match applications for this challenge that are accepted
      {
        $match: {
          challenge: new Types.ObjectId(challengeId),
          status: ApplicationStatus.ACCEPTED
        }
      },
      // Lookup applicant (team leader) details
      {
        $lookup: {
          from: 'users',
          localField: 'applicant',
          foreignField: '_id',
          as: 'applicant'
        }
      },
      { $unwind: '$applicant' },
      // For team applications, lookup team members
      {
        $lookup: {
          from: 'users',
          localField: 'teamMembers.user',
          foreignField: '_id',
          as: 'teamMembersDetails'
        }
      },
      // Create separate documents for team leader and members
      {
        $project: {
          participants: {
            $concatArrays: [
              [{
                firstName: '$applicant.firstName',
                lastName: '$applicant.lastName',
                email: '$applicant.email',
                role: 'TEAM_LEADER'
              }],
              {
                $cond: {
                  if: { $eq: ['$type', ApplicationType.TEAM] },
                  then: {
                    $map: {
                      input: '$teamMembersDetails',
                      as: 'member',
                      in: {
                        firstName: '$$member.firstName',
                        lastName: '$$member.lastName',
                        email: '$$member.email',
                        role: 'TEAM_MEMBER'
                      }
                    }
                  },
                  else: []
                }
              }
            ]
          }
        }
      },
      // Unwind the participants array
      { $unwind: '$participants' },
      // Group all participants together
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: limit },
            { $replaceRoot: { newRoot: '$participants' } }
          ]
        }
      }
    ];

    const [result] = await this.applicationModel.aggregate(aggregationPipeline);

    const total = result.metadata[0]?.total || 0;
    const pages = Math.ceil(total / limit);

    return {
      data: result.data || [],
      total,
      page,
      pages
    };
  }

}