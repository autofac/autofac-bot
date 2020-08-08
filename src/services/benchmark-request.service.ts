import fetch, { Response } from 'node-fetch';
import { Context } from 'probot';
import { BenchmarkNotificationsService } from '.';
import {
  BenchmarkRequest,
  RunningRequest,
  TargetSourceRepository,
} from '../models';
import { BenchmarkCommand } from '../models/benchmark-command.model';
import { BenchmarkCommandParser } from '../parser';
import { BenchmarkRequestValidation } from '../validation/benchmark.validation';
import { IssueInfoLoaderService } from './issue-infoloader.service';

let runningRequest: RunningRequest | null = null;

export class BenchmarkRequesterService {
  public constructor(
    private benchmarkRequestValidation: BenchmarkRequestValidation,
    private benchmarkCommandParser: BenchmarkCommandParser,
    private notificationService: BenchmarkNotificationsService,
    private issueInfoLoaderService: IssueInfoLoaderService
  ) {}

  public async postBenchmarkRequest(
    context: Context,
    words: string[]
  ): Promise<void> {
    if (runningRequest) {
      await this.notificationService.notifiyRunningRequest(
        context,
        runningRequest
      );
      return;
    }

    if (!this.benchmarkRequestValidation.validRequest(context, words)) {
      await this.notificationService.notifyInvalidForIssue(context);
      return;
    }

    if (!this.benchmarkRequestValidation.validBenchmark(words)) {
      await this.notificationService.notifiyInvalidBenchmarkName(
        context,
        words[2]
      );
      return;
    }

    const benchmarkCommand = this.benchmarkCommandParser.parse(words);

    console.log('BenchmarkCommand', benchmarkCommand);

    const repositoryInfoResponse = await this.issueInfoLoaderService.loadRepositoryInfo(
      context
    );

    if (!repositoryInfoResponse.ok) {
      await this.notificationService.notifyRepositoryInfoRequestFailure(
        context,
        repositoryInfoResponse
      );
      return;
    }

    let targetSourceRepository = await this.extractTargetAndSourceRepository(
      repositoryInfoResponse
    );

    const pullRequestInfoResponse = await this.issueInfoLoaderService.loadPullRequestInfo(
      context
    );

    if (pullRequestInfoResponse && !pullRequestInfoResponse.ok) {
      await this.notificationService.notifyPullRequestInfoRequestFailure(
        context,
        pullRequestInfoResponse
      );
      return;
    }

    const benchmarkRequest = await this.buildRequest(
      benchmarkCommand,
      targetSourceRepository,
      pullRequestInfoResponse
    );

    console.log('Sending benchmark request', benchmarkRequest);

    runningRequest = {
      startedAt: new Date(),
      requester: context.payload.sender.login,
      request: benchmarkRequest,
    };

    const benchmarkResponse = await this.executeBenchmark(benchmarkRequest);

    if (!benchmarkResponse) {
      await this.notificationService.notifyBenchmarkApiUnavailable(context);
      return;
    }

    if (benchmarkResponse.ok) {
      await this.notificationService.notifyBenchmarkResults(
        context,
        benchmarkResponse
      );
      return;
    }

    await this.notificationService.notifyBenchmarkRequestFailure(
      context,
      benchmarkResponse
    );
  }

  private async executeBenchmark(
    benchmarkRequest: BenchmarkRequest
  ): Promise<Response | null> {
    const response = await fetch('http://localhost:5000/api/v1/benchmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json charset=UTF-8' },
      body: JSON.stringify(benchmarkRequest),
    }).catch((requestError) => {
      console.error(requestError);
      return null;
    });

    runningRequest = null;

    return response;
  }

  private async buildRequest(
    benchmarkCommand: BenchmarkCommand,
    targetSourceRepository: TargetSourceRepository,
    pullRequestInfoResponse: Response | null = null
  ): Promise<BenchmarkRequest> {
    if (pullRequestInfoResponse) {
      const pullInfo = await pullRequestInfoResponse.json();
      targetSourceRepository.source = pullInfo.head.repo.clone_url;

      if (!benchmarkCommand.sourceRef) {
        benchmarkCommand.sourceRef = pullInfo.head.ref;
      }

      if (!benchmarkCommand.targetRef) {
        benchmarkCommand.targetRef = pullInfo.base.ref;
      }
    }

    return {
      benchmark: benchmarkCommand.benchmarkName,
      verbose: benchmarkCommand.verbose,
      targetRepository: {
        ref: benchmarkCommand.targetRef!,
        url: targetSourceRepository.target,
      },
      sourceRepository: {
        ref: benchmarkCommand.sourceRef!,
        url: targetSourceRepository.source,
      },
    };
  }

  private async extractTargetAndSourceRepository(
    repositoryInfo: Response
  ): Promise<TargetSourceRepository> {
    const repository = await repositoryInfo.json();

    let targetRepository = { ...repository }.clone_url;
    let sourceRepository = { ...repository }.clone_url;

    return {
      target: targetRepository,
      source: sourceRepository,
    };
  }
}
