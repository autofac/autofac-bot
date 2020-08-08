import {
  AUTOFAC_BOT_ALIAS,
  BENCHMARK_COMMAD,
  VALID_BENCHMARKS,
} from '../constants';

const VALID_BENCHMARK_SAMPLES = [
  `* Comparing a commit with a branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} OpenGenericBenchmark commit:d13dfd6 v6\``,
  `* Comparing a commit with another commit \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} OpenGenericBenchmark commit:d13dfd6 commit:d13dfdf\``,
  `* Comparing a tag with a branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark tag:v5.2.0 v6\``,
  `* Comparing a tag with a tag \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark tag:v5.2.0 tag:v6.0.0\``,
  `* Comparing a branch with another branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark develop v6\``,
];

const ADDITIONAL_INFO_TEXT = `
  Benchmarks can be executed in **issues** and **pull-requests**.\n\n
  * **Issues**: The Autofac repository is used to clone the target and source
  * **Pull requests**: The Autofac repository is used as the target, the repository from the PR containing the changes is used as the source
  \nIn both cases the syntax is the same.\n\n

  When commenting on **pull-requests** you neither need to define the target, nor the source. You can still decide to define both though.
  `;

export class HelpGeneratorBuilder {
  private helpParts: string[] = [];

  public withDefaultHeader(senderName: string): HelpGeneratorBuilder {
    this.helpParts.push(`Hi @${senderName}!\n\n`);
    return this;
  }

  public withCommands(): HelpGeneratorBuilder {
    this.helpParts.push('You can execute the following commands:\n');
    this.helpParts.push(
      `* \`help\` - Lists tasks I am able to help you with - synopsis: \`${AUTOFAC_BOT_ALIAS} help\`\n`
    );
    this.helpParts.push(
      `* \`benchmark\` - synopsis: \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} <BenchmarkName> <Target> <Source>\`\n\n`
    );

    return this;
  }

  public withAdditionalBenchmarkInfo(): HelpGeneratorBuilder {
    this.helpParts.push(
      `<details>\n<summary>Additional information</summary>\n\n${ADDITIONAL_INFO_TEXT}\n</details>\n\n`
    );
    return this;
  }

  public withBenchmarkSamples(): HelpGeneratorBuilder {
    this.helpParts.push(
      `<details>\n<summary>Show benchmark command samples</summary>\n\n${VALID_BENCHMARK_SAMPLES.join(
        '\n'
      )}\n</details>\n\n`
    );

    return this;
  }

  public withListOfBenchmarks(): HelpGeneratorBuilder {
    this.helpParts.push(
      `<details>\n<summary>Show list of runnable benchmarks</summary>\n\n${VALID_BENCHMARKS.join(
        '\n'
      )}\n</details>`
    );

    return this;
  }

  public build(): string {
    const helpOutput = ''.concat(...this.helpParts);

    this.helpParts = [];

    return helpOutput;
  }
}
