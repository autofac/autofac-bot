import { BenchmarkRequest } from './benchmark-request.model';

export interface RunningRequest {
    startedAt: Date,
    requester: string,
    request: BenchmarkRequest,
}