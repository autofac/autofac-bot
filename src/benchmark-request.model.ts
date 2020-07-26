import { Repository } from './repository.request.model';

export interface Request {
  targetRepository: Repository;
  sourceRepository: Repository;
  benchmark: string;
}