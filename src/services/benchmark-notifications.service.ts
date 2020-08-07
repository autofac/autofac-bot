import { Response } from 'node-fetch';
import { Context } from 'probot';
import { VALID_BENCHMARKS } from '../constants';
import { RunningRequest } from '../models';

export class BenchmarkNotificationsService {
  public async notifiyRunningRequest(
    context: Context,
    runningRequest: RunningRequest
  ): Promise<void> {
    const json = JSON.stringify(runningRequest);

    const repositoryInfoRequestFailureComment = context.issue({
      body: `Another benchmark request is currently being executed, you need to wait for it to finish. Currently running request:\n\n\`\`\`json\n${json}\n\`\`\``,
    });

    await context.github.issues.createComment(
      repositoryInfoRequestFailureComment
    );
  }

  public async notifyInvalidForIssue(context: Context): Promise<void> {
    const invalidRequestComment = context.issue({
      body:
        'Command is **invalid** for the given context.\n\n Within an issue you must provide the wanted benchmark, target and source!',
    });
    await context.github.issues.createComment(invalidRequestComment);
  }

  public async notifiyInvalidBenchmarkName(
    context: Context,
    benchmarkName: string
  ): Promise<void> {
    const invalidBenchmarkComment = context.issue({
      body: `The benchmark \`${benchmarkName}\` is **invalid**! Valid benchmarks are:\n${VALID_BENCHMARKS.join(
        '\n'
      )}`,
    });
    await context.github.issues.createComment(invalidBenchmarkComment);
  }

  public async notifyRepositoryInfoRequestFailure(
    context: Context,
    repositoryInfoResponse: Response
  ): Promise<void> {
    const text = await repositoryInfoResponse.text();

    const repositoryInfoRequestFailureComment = context.issue({
      body: `**Failed** to request repository information. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\``,
    });

    await context.github.issues.createComment(
      repositoryInfoRequestFailureComment
    );
  }

  public async notifyPullRequestInfoRequestFailure(
    context: Context,
    pullRequestInfoResponse: Response
  ): Promise<void> {
    const text = await pullRequestInfoResponse.text();

    const repositoryInfoRequestFailureComment = context.issue({
      body: `**Failed** to request pull-request information. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\``,
    });

    await context.github.issues.createComment(
      repositoryInfoRequestFailureComment
    );
  }

  public async notifyBenchmarkApiUnavailable(context: Context): Promise<void> {
    const repositoryInfoRequestFailureComment = context.issue({
      body: `Sorry, can't fullfil your request. It looks like the benchmark-api is **offline**.`,
    });

    await context.github.issues.createComment(
      repositoryInfoRequestFailureComment
    );
  }

  public async notifyBenchmarkRequestFailure(
    context: Context,
    benchmarkRequestResponse: Response
  ): Promise<void> {
    const text = await benchmarkRequestResponse.text();

    const repositoryInfoRequestFailureComment = context.issue({
      body: `Benchmark api-service request has **failed**. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\``,
    });

    await context.github.issues.createComment(
      repositoryInfoRequestFailureComment
    );
  }

  public async notifyBenchmarkResults(
    context: Context,
    benchmarkRequestResponse: Response
  ): Promise<void> {
    const benchmarkResult = await benchmarkRequestResponse.text();

    const issueComment = context.issue({ body: benchmarkResult });
    await context.github.issues.createComment(issueComment);
  }
}
