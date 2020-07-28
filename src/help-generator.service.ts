import { AUTOFAC_BOT_ALIAS, BENCHMARK_COMMAD } from './constants';

const VALID_BENCHMARKS = [
    '* ChildScopeResolveBenchmark',
    '* ConcurrencyBenchmark',
    '* ConcurrencyNestedScopeBenchmark',
    '* KeyedGenericBenchmark',
    '* KeyedNestedBenchmark',
    '* KeyedSimpleBenchmark',
    '* KeylessGenericBenchmark',
    '* KeylessNestedBenchmark',
    '* KeylessNestedSharedInstanceBenchmark',
    '* KeylessNestedLambdaBenchmark',
    '* KeylessNestedSharedInstanceLambdaBenchmark',
    '* KeylessSimpleBenchmark',
    '* KeylessSimpleSharedInstanceBenchmark',
    '* KeylessSimpleLambdaBenchmark',
    '* KeylessSimpleSharedInstanceLambdaBenchmark',
    '* DeepGraphResolveBenchmark',
    '* EnumerableResolveBenchmark',
    '* PropertyInjectionBenchmark',
    '* RootContainerResolveBenchmark',
    '* OpenGenericBenchmark',
];

const VALID_BENCHMARK_SAMPLES = [
    `* Comparing a commit with a branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} OpenGenericBenchmark commit:d13dfd6 v6\``,
    `* Comparing a commit with another commit \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} OpenGenericBenchmark commit:d13dfd6 commit:d13dfdf\``,
    `* Comparing a tag with a branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark tag:v5.2.0 v6\``,
    `* Comparing a tag with a tag \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark tag:v5.2.0 tag:v6.0.0\``,
    `* Comparing a branch with another branch \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} RootContainerResolveBenchmark develop v6\``
];

const ADDITIONAL_INFO_TEXT = `
  Benchmarks can be executed in **issues** and **pull-requests**.\n\n
  * **Issues**: The Autofac repository is used to clone the target and source
  * **Pull requests**: The Autofac repository is used as the target, the repository from the PR containing the changes is used as the source
  \nIn both cases the syntax is the same.\n\n

  When commenting on **pull-requests** you neither need to define the target, nor the source. You can still decide to define both though.
  `

export class HelpGeneratorService {
    public generate(senderName: string): string {
        let help = `Hi @${senderName}!\n\n`;
        help += 'You can execute the following commands:\n';
        help += `* \`help\` - Lists tasks I am able to help you with - synopsis: \`${AUTOFAC_BOT_ALIAS} help\`\n`;
        help += `* \`benchmark\` - synopsis: \`${AUTOFAC_BOT_ALIAS} ${BENCHMARK_COMMAD} <BenchmarkName> <Target> <Source>\`\n\n`
        help += `<details>\n<summary>Additional information</summary>\n\n${ADDITIONAL_INFO_TEXT}\n</details>\n\n`;
        help += `<details>\n<summary>Show benchmark command samples</summary>\n\n${VALID_BENCHMARK_SAMPLES.join('\n')}\n</details>\n\n`;
        help += `<details>\n<summary>Show list of runnable benchmarks</summary>\n\n${VALID_BENCHMARKS.join('\n')}\n</details>`;
        return help;
    }
}