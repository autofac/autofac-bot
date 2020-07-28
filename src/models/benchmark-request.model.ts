import { Repository } from './repository.request.model';

export interface BenchmarkRequest {
  targetRepository: Repository;
  sourceRepository: Repository;
  benchmark: string;
}