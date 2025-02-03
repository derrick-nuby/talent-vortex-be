import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ChallengeService } from '../challenge.service';
import { User } from '../../user/schemas/user.schema';
import { ApplyChallengeDto } from '../dto/apply-challenge.dto';
import { Application, ApplicationType } from '../schemas/application.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Challenge } from '../schemas/challenge.schema';
import { Model } from 'mongoose';
import { ChallengeStatus } from '../enums/ChallengeStatus';
import { ApplicationStatus } from '../enums/ApplicationStatus';
import { UserService } from '../../user/user.service';
import { TeamMemberStatus } from '../enums/TeamMemberStatus';
import { ChallengeType } from '../enums/ChallengeType';
import { v4 as uuidV4 } from 'uuid';
import { MailService } from '../../mail/mail.service';


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

  private async handleApplicationRejection(application: Application): Promise<void> {

    await this.mailService.sendRejectionEmail(
      application.applicant.email,
      application.challenge.title,
      "A team member has declined the invitation"
    )

    await application.deleteOne();

  }

  async handleInvitationResponse(token: string, accept: boolean): Promise<void> {
    const application = await this.applicationModel.findOne({
      'teamMembers.token': token,
      'teamMembers.tokenExpiresAt': { $gt: new Date() }
    }).exec();

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

      await this.handleApplicationRejection(application);
      return;
    }

    await application.save();
    await this.checkApplicationStatus(application);
  }

}