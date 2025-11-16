import { AsyncLocalStorage } from "node:async_hooks";
import pLimit, { type LimitFunction } from "p-limit";
import type { AvailableSteps } from "./utils/AvailableSteps.ts";
import type { InferEngineSteps, WorkflowEngine } from "./WorkflowEngine.ts";
import type { AnyWorkflowStep, InferWorkflowStepInput, InferWorkflowStepOutput, WorkflowStep } from "./WorkflowStep.ts";
import { withRetry } from "../utils/withRetry.ts";

export class WorkflowContext<const STEPS extends AnyWorkflowStep[] = []> {
  private engine: WorkflowEngine<STEPS>;
  private historyStorage = new Map<AnyWorkflowStep, unknown[]>();
  private stepLimits = new Map<AnyWorkflowStep, LimitFunction>();
  private totalCompleted = new Map<AnyWorkflowStep, number>();
  private totalFailed = new Map<AnyWorkflowStep, number>();

  constructor(engine: WorkflowEngine<STEPS>) {
    this.engine = engine;
  }

  private startLogging(interval: number = 1000) {
    setInterval(() => {
      const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;
      console.log(`--- ${new Date().toISOString()} --- Memory Usage: ${memoryUsage.toFixed(2)} MB ---`);

      const rows: { Step: string; Waiting: number; Active: number; Completed: number; Failed: number; Percent: string; }[] = [];

      for (const [step, limit] of this.stepLimits) {
        if (step.config?.hideLogging) continue;

        const completed = this.totalCompleted.get(step) || 0;
        const failed = this.totalFailed.get(step) || 0;
        const pending = (limit as any).pendingCount || 0;
        const active = (limit as any).activeCount || 0;
        const total = completed + active + pending + failed;
        const percent = total === 0 ? "0.00%" : `${((completed / total) * 100).toFixed(2)}%`;

        rows.push({
          Step: step?.constructor?.name ?? "unknown",
          Waiting: pending,
          Active: active,
          Completed: completed,
          Failed: failed,
          Percent: percent,
        });
      }

      console.table(rows);
    }, interval);
  }

  private getStepLimit(step: AnyWorkflowStep): LimitFunction {
    let limit = this.stepLimits.get(step);
    if (!limit) {
      // @ts-expect-error `concurrency` is private
      const engineConcurrency = this.engine.concurrency;
      const concurrency = step.config?.concurrency ?? engineConcurrency;
      limit = typeof concurrency === 'number' ? pLimit(concurrency) : concurrency;
      this.stepLimits.set(step, limit);
    }
    return limit;
  }

  private async run<STEP extends AvailableSteps<STEPS>>(step: STEP, input: InferWorkflowStepInput<STEP>) {
    const thens = this.engine.flows.get(step) || [];

    let expected = 0;
    let completed = 0;

    try {
      for await (const output of step.execute(input, this as never)) {
        const that = this.withHistory(step, output);
        for (const then of thens) {
          expected++;
          const limit = that.getStepLimit(then);
          const fn = step.config?.retryCount
            ? withRetry(() => that.run(then, output), step.config.retryCount)
            : () => that.run(then, output);
          limit(fn).then(({ wait }) => wait).then(() => completed++);
        }
      }

      const total = this.totalCompleted.get(step) || 0;
      this.totalCompleted.set(step, total + 1);

      return {
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
        wait: new Promise<void>(async (resolve) => {
          // Wait for all tasks to complete
          while (completed < expected) {
            await new Promise(resolve => setImmediate(resolve));
          }

          resolve();
        })
      };
    } catch (error) {
      const total = this.totalFailed.get(step) || 0;
      this.totalFailed.set(step, total + 1);
      return { wait: Promise.resolve(), error };
    }
  }

  private withHistory<STEP extends AnyWorkflowStep, OUTPUT>(step: STEP, output: OUTPUT) {
    const history = new Map(this.historyStorage);
    const previousHistory = this.historyStorage.get(step) || [];
    const nextHistory = [...previousHistory, output];
    history.set(step, nextHistory);
    const ctx = new WorkflowContext<STEPS>(this.engine);
    Object.assign(ctx, this);
    ctx.historyStorage = history;
    return ctx;
  }

  getHistory<STEP extends AvailableSteps<STEPS>>(step: STEP): InferWorkflowStepOutput<STEP>[] {
    return (this.historyStorage.get(step) || []) as InferWorkflowStepOutput<STEP>[];
  }
}
