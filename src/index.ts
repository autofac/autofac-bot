
import { Application } from 'probot'; // eslint-disable-line no-unused-vars
import { validCommand } from './command.extractor';
import { BENCHMARK_COMMAD, HELP_COMMAND, UNKNWON_COMMAND } from './constants';
import { postBenchmarkRequest } from './execute.functions';
import { autobotRequest } from './guard.functions';
import { postHelpComment } from './help.function';

export = (app: Application) => {
  app.on('issue_comment', async (context) => {
    if (context.isBot) return;

    if (context.payload.action === 'deleted') return;

    if (context.payload.issue.author_association !== 'MEMBER') return;

    if (!autobotRequest(context)) return;

    const words = context
      .payload
      .comment
      .body
      .trimLeft()
      .trimRight()
      .split(' ');

    console.log(words);

    if (words?.length < 2) return;

    const command = validCommand(words[1]);

    if (command === UNKNWON_COMMAND) {
      return;
    }

    if (command === HELP_COMMAND) {
      await postHelpComment(context);
      return;
    }

    if (command !== BENCHMARK_COMMAD) {
      return;
    }

    await postBenchmarkRequest(context, words);
  });
}
