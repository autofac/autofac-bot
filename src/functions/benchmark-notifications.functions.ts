import { Response } from 'node-fetch';
import { Context } from 'probot';
import { VALID_BENCHMARKS } from '../constants';


export async function notifyInvalidForIssue(context: Context): Promise<void> {
    const invalidRequestComment = context.issue({ body: 'Command is **invalid** for the given context.\n\n Within an issue you must provide the wanted benchmark, target and source!' })
    await context.github.issues.createComment(invalidRequestComment)
}

export async function notifiyInvalidBenchmarkName(context: Context, benchmarkName: string): Promise<void> {
    const invalidBenchmarkComment = context
        .issue({ body: `The benchmark \`${benchmarkName}\` is **invalid**! Valid benchmarks are:\n${VALID_BENCHMARKS.join('\n')}` });
    await context.github.issues.createComment(invalidBenchmarkComment)
}

export async function notifyRepositoryInfoRequestFailure(context: Context, repositoryInfoResponse: Response): Promise<void> {
    const text = await repositoryInfoResponse.text();

    const repositoryInfoRequestFailureComment = context
        .issue({ body: `**Failed** to request repository information. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\`` });

    await context.github.issues.createComment(repositoryInfoRequestFailureComment)
}

export async function notifyPullRequestInfoRequestFailure(context: Context, pullRequestInfoResponse: Response): Promise<void> {
    const text = await pullRequestInfoResponse.text();

    const repositoryInfoRequestFailureComment = context
        .issue({ body: `**Failed** to request pull-request information. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\`` });

    await context.github.issues.createComment(repositoryInfoRequestFailureComment)
}

export async function notifyBenchmarkApiUnavailable(context: Context): Promise<void> {
    const repositoryInfoRequestFailureComment = context
        .issue({ body: `Sorry, can't fullfil your request. It looks like the benchmark-api is **offline**.` });

    await context.github.issues.createComment(repositoryInfoRequestFailureComment)
}

export async function notifyBenchmarkRequestFailure(context: Context, benchmarkRequestResponse: Response): Promise<void> {
    const text = await benchmarkRequestResponse.text();

    const repositoryInfoRequestFailureComment = context
        .issue({ body: `**Failed** to request pull-request information. Check out the error for more details:\n\n\`\`\`text\n${text}\n\`\`\`` });

    await context.github.issues.createComment(repositoryInfoRequestFailureComment)
}

export async function notifyBenchmarkResults(context: Context, benchmarkRequestResponse: Response): Promise<void> {
    const benchmarkResult = await benchmarkRequestResponse.text();

    const issueComment = context.issue({ body: benchmarkResult })
    await context.github.issues.createComment(issueComment)
}