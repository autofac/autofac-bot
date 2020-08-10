import { Context } from 'probot';
import { HelpGeneratorBuilder } from '../builder/help-generator.builder';

export class HelpRequestService {
  public constructor(private helpGenerator: HelpGeneratorBuilder) {}

  public async postHelpComment(context: Context): Promise<any> {
    const help = this.helpGenerator
      .withDefaultHeader(context.payload.sender.login)
      .withCommands()
      .withAdditionalBenchmarkInfo()
      .withBenchmarkSamples()
      .withListOfBenchmarks()
      .build();

    const helpComment = context.issue({
      body: help,
    });

    await context.github.issues.createComment(helpComment);

    return;
  }
}
