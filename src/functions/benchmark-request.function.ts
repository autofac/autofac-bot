import fetch, { Response } from 'node-fetch';
import { Context } from 'probot';
import { BenchmarkRequest, RunningRequest, TargetSourceRepository } from '../models';
import { validBenchmark, validRequest } from '../validation/benchmark.validation';
import {
    notifiyInvalidBenchmarkName,
    notifiyRunningRequest,
    notifyBenchmarkApiUnavailable,
    notifyBenchmarkRequestFailure, notifyBenchmarkResults,
    notifyInvalidForIssue,
    notifyPullRequestInfoRequestFailure, notifyRepositoryInfoRequestFailure
} from './benchmark-notifications.functions';
import { loadPullRequestInfo, loadRepositoryInfo } from './issue-request.functions';

let runningRequest: RunningRequest | null = null;

export async function postBenchmarkRequest(context: Context, words: string[]): Promise<void> {
    if (runningRequest) {
        await notifiyRunningRequest(context, runningRequest);
        return;
    }

    if (!validRequest(context, words)) {
        await notifyInvalidForIssue(context);
        return;
    }
    if (!validBenchmark(words)) {
        await notifiyInvalidBenchmarkName(context, words[2]);
        return;
    }

    const repositoryInfoResponse = await loadRepositoryInfo(context);

    if (!repositoryInfoResponse.ok) {
        await notifyRepositoryInfoRequestFailure(context, repositoryInfoResponse);
        return;
    }

    let targetSourceRepository = await extractTargetAndSourceRepository(repositoryInfoResponse);

    const pullRequestInfoResponse = await loadPullRequestInfo(context);

    if (pullRequestInfoResponse && !pullRequestInfoResponse.ok) {
        await notifyPullRequestInfoRequestFailure(context, pullRequestInfoResponse);
        return;
    }

    const benchmarkRequest = await buildRequest(words, targetSourceRepository, pullRequestInfoResponse);

    console.log('Sending benchmark request', benchmarkRequest);

    runningRequest = {
        startedAt: new Date(),
        requester: context.payload.sender.login,
        request: benchmarkRequest,
    }

    const benchmarkResponse = await executeBenchmark(benchmarkRequest);

    if (!benchmarkResponse) {
        await notifyBenchmarkApiUnavailable(context);
        return;
    }

    if (benchmarkResponse.ok) {
        await notifyBenchmarkResults(context, benchmarkResponse);
        return;
    }

    await notifyBenchmarkRequestFailure(context, benchmarkResponse);
}

async function executeBenchmark(benchmarkRequest: BenchmarkRequest): Promise<Response | null> {
    const response = await fetch('http://localhost:5000/api/v1/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json charset=UTF-8' },
        body: JSON.stringify(benchmarkRequest)
    }).catch(requestError => {
        console.error(requestError);
        return null;
    });

    runningRequest = null;

    return response;
}

function getTargetAndSourceRef(words: string[]): [string, string] {
    let targetRef = '';
    let sourceRef = '';

    if (words.length === 4) {
        targetRef = words[3];
    }

    if (words.length === 5) {
        targetRef = words[3];
        sourceRef = words[4];
    }

    return [targetRef, sourceRef];
}

async function buildRequest(words: string[], targetSourceRepository: TargetSourceRepository, pullRequestInfoResponse: Response | null = null): Promise<BenchmarkRequest> {
    let [targetRef, sourceRef] = getTargetAndSourceRef(words);

    if (pullRequestInfoResponse) {
        const pullInfo = await pullRequestInfoResponse.json()
        targetSourceRepository.source = pullInfo.head.repo.clone_url;

        if (sourceRef === '') {
            sourceRef = pullInfo.head.ref;
        }

        if (targetRef === '') {
            targetRef = pullInfo.base.ref;
        }
    }

    return {
        benchmark: words[2],
        targetRepository: {
            ref: targetRef,
            url: targetSourceRepository.target
        },
        sourceRepository: {
            ref: sourceRef,
            url: targetSourceRepository.source
        }
    }
}

async function extractTargetAndSourceRepository(repositoryInfo: Response): Promise<TargetSourceRepository> {
    const repository = await repositoryInfo.json();

    let targetRepository = { ...repository }.clone_url;
    let sourceRepository = { ...repository }.clone_url;

    return {
        target: targetRepository,
        source: sourceRepository
    }
}

