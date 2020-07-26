
import { Application } from 'probot'; // eslint-disable-line no-unused-vars
import { postBenchmarkRequest, postHelpComment } from './execute.functions';
import { autobotRequest } from './guard.functions';

export = (app: Application) => {
  app.on('*', async _ => {
    // const pullRequest = context.payload.pull_request;
    // const issue = context.payload.issue;
    // console.log(context.payload.issue);
    // console.log('pullRequest:', pullRequest !== undefined, 'issue', issue !== undefined, context.payload.action);
  })

  app.on('issue_comment', async (context) => {
    if (context.isBot) return;

    if (context.payload.action === 'deleted') return;

    if (context.payload.issue.author_association !== 'MEMBER') {
      console.log('NOT A MEMBER'!);
      return;
    }

    const comment = context.payload.comment.body;

    if (!autobotRequest(comment)) return;

    const words = comment
      .trimLeft()
      .trimRight()
      .split(' ');

    if (words.findIndex(word => word.toLowerCase() === 'help') > -1) {
      await postHelpComment(context);
      return;
    }

    if (words.findIndex(word => word.toLowerCase() === 'benchmark') > -1) {
      await postBenchmarkRequest(context, words);
      return;
    }

    const issueComment = context.issue({ body: words.join('<br />') });
    await context.github.issues.createComment(issueComment);
  });
}
