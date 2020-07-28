import { Context } from 'probot';
import { VALID_BENCHMARKS } from '../constants';

export function validRequest(context: Context, words: string[]): boolean {
    const pullRequest = context.payload.issue.pull_request !== undefined;

    return pullRequest || words.length >= 5;
}

export function validBenchmark(words: string[]): boolean {
    const benchmarkName = words[2];

    return VALID_BENCHMARKS.findIndex(benchmark => benchmark.replace('* ', '').toLowerCase() === benchmarkName.toLowerCase()) > -1;
}