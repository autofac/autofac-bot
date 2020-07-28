import fetch from 'node-fetch';
import { Context } from 'probot';
import { Request } from './benchmark-request.model';


export async function postBenchmarkRequest(context: Context, words: string[]): Promise<any> {
    const issue = context.payload.issue;

    const repositoryUrl = issue.repository_url;

    const repositoryInfoRequest = await fetch(repositoryUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json charset=UTF-8' },
    });

    const targetRepository = (await repositoryInfoRequest.json());
    let sourceRepositoryUrl = { ...targetRepository }.clone_url;

    const pullRequest = issue.pull_request !== undefined;

    if (!pullRequest && words.length !== 5) {
        const invalidRequestComment = context.issue({ body: 'A benchmark request for an issue must provide the wanted benchmark, target and source!' })
        await context.github.issues.createComment(invalidRequestComment)
    }

    const benchmarkName = words[2];
    let targetRef = '';
    let sourceRef = '';

    console.log(words.length, words);

    if (words.length === 4) {
        targetRef = words[3];
    }

    if (words.length === 5) {
        targetRef = words[3];
        sourceRef = words[4];
    }


    if (issue.pull_request) {
        const req = await fetch(issue.pull_request.url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json charset=UTF-8' },
        });

        const pullInfo = await req.json()
        // console.log('pullinfo', pullInfo);
        sourceRepositoryUrl = pullInfo.head.repo.clone_url;

        if (sourceRef === '') {
            sourceRef = pullInfo.head.ref;
        }

        if (targetRef === '') {
            targetRef = pullInfo.base.ref;
        }
    }

    console.log('bench:', benchmarkName);
    console.log('source:', sourceRef);
    console.log('target:', targetRef);

    const request: Request = {
        benchmark: benchmarkName,
        targetRepository: {
            branch: targetRef,
            url: targetRepository.clone_url
        },
        sourceRepository: {
            branch: sourceRef,
            url: sourceRepositoryUrl
        }
    }

    console.log('Sending benchmark request');

    const benchmarkRequest = await fetch('http://localhost:5000/api/v1/benchmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json charset=UTF-8' },
        body: JSON.stringify(request)
    });

    const benchmarkResponse = await benchmarkRequest.text();

    const issueComment = context.issue({ body: benchmarkResponse })
    await context.github.issues.createComment(issueComment)
}