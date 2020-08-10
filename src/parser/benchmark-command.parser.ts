import { BenchmarkCommand } from '../models/benchmark-command.model';

const verbose = 'verbose';

export class BenchmarkCommandParser {
  public parse(words: string[]): BenchmarkCommand {
    const slice = words.slice(2, words.length);

    const benchmarkName = slice[0];

    const lastWord = slice[slice.length - 1];

    const verboseRequest = lastWord.toLowerCase() === verbose;

    let targetRef, sourceRef;

    targetRef =
      slice.length >= 2 && slice[1].toLowerCase() !== verbose ? slice[1] : null;

    sourceRef =
      slice.length >= 3 && slice[2].toLowerCase() !== verbose ? slice[2] : null;

    return {
      benchmarkName: benchmarkName,
      verbose: verboseRequest,
      targetRef: targetRef,
      sourceRef: sourceRef,
    };
  }
}
