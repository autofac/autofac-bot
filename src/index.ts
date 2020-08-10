import { Application } from 'probot';
import { HelpGeneratorBuilder } from './builder';
import { BENCHMARK_COMMAD, HELP_COMMAND, UNKNWON_COMMAND } from './constants';
import { autobotRequest } from './guards/guard.functions';
import { extractCommand } from './helper/command.extractor';
import {
  BenchmarkNotificationsService,
  BenchmarkRequesterService,
  HelpRequestService,
} from './services';
import { IssueInfoLoaderService } from './services/issue-infoloader.service';
import { BenchmarkRequestValidation } from './validation/benchmark.validation';

const ISSUE_COMMENT = 'issue_comment';

const DELETE_ACTION = 'deleted';

const MEMBER = 'MEMBER';

const OWNER = 'OWNER';

export = (app: Application) => {
  app.on(ISSUE_COMMENT, async (context) => {
    if (context.isBot) return;

    if (context.payload.action === DELETE_ACTION) return;

    const association = context.payload.issue.author_association;

    if (!(association === MEMBER || association === OWNER)) {
      return;
    }

    if (!autobotRequest(context)) return;

    const words = context.payload.comment.body
      .trimLeft()
      .trimRight()
      .split(' ');

    if (words?.length < 2) return;

    const command = extractCommand(words[1]);

    if (command === UNKNWON_COMMAND) {
      return;
    }

    if (command === HELP_COMMAND) {
      const helpRequestService = new HelpRequestService(
        new HelpGeneratorBuilder()
      );
      await helpRequestService.postHelpComment(context);
      return;
    }

    if (command !== BENCHMARK_COMMAD) {
      return;
    }

    const benchmarkRequestService = new BenchmarkRequesterService(
      new BenchmarkNotificationsService(),
      new BenchmarkRequestValidation(),
      new IssueInfoLoaderService()
    );

    await benchmarkRequestService.postBenchmarkRequest(context, words);
  });
};
