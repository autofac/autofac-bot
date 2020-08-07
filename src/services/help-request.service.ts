import { Context } from 'probot';
import { HelpGeneratorService } from '../builder/help-generator.service';

export class HelpRequestService {
  public constructor(private helpGenerator: HelpGeneratorService) {}

  public async postHelpComment(context: Context): Promise<any> {
    const help = context.issue({
      body: this.helpGenerator.generate(context.payload.sender.login),
    });

    await context.github.issues.createComment(help);

    return;
  }
}
