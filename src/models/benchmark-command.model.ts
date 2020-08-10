export interface BenchmarkCommand {
  benchmarkName: string;
  verbose: boolean;
  targetRef: string | null;
  sourceRef: string | null;
}
