import pLimit, { type LimitFunction } from "p-limit";
import type { AvailableSteps } from "./utils/AvailableSteps.ts";
import type { InferEngineSteps, WorkflowEngine } from "./WorkflowEngine.ts";
import type { AnyWorkflowStep, InferWorkflowStepInput, WorkflowStep } from "./WorkflowStep.ts";

export class WorkflowContext<const STEPS extends AnyWorkflowStep[] = []> {
  private engine: WorkflowEngine<STEPS>;
  // private valueHistory = new Map<AnyWorkflowStep, unknown[]>();
  private stepLimits = new Map<AnyWorkflowStep, LimitFunction>();
  private totalCompleted = new Map<AnyWorkflowStep, number>();

  constructor(engine: WorkflowEngine<STEPS>) {
    this.engine = engine;

    setInterval(() => {
      console.log(`--- ${new Date().toISOString()} ---`);

      const rows: { Step: string; Waiting: number; Active: number; Completed: number; Percent: string }[] = [];

      for (const [step, limit] of this.stepLimits) {
        if (step.config?.hideLogging) continue;

        const completed = this.totalCompleted.get(step) || 0;
        const pending = (limit as any).pendingCount || 0;
        const active = (limit as any).activeCount || 0;
        const total = completed + active + pending;
        const percent = total === 0 ? "0.00%" : `${((completed / total) * 100).toFixed(2)}%`;

        rows.push({
          Step: step?.constructor?.name ?? "unknown",
          Waiting: pending,
          Active: active,
          Completed: completed,
          Percent: percent,
        });
      }

      console.table(rows);
    }, 1000);
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
    for await (const output of step.execute(input, this as never)) {
      for (const then of thens) {
        expected++;
        const limit = this.getStepLimit(then);
        limit(() => this.run(then, output)).finally(() => {
          completed++;
        });
      }
    }

    // Wait for all tasks to complete
    while (completed < expected) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const total = this.totalCompleted.get(step) || 0;
    this.totalCompleted.set(step, total + 1);
  }
}

export const createWorkflowContext = <ENGINE extends WorkflowEngine<any[]>>() => {
  return {
    new: (engine: ENGINE) => new WorkflowContext(engine),
    step: <INPUT = undefined, OUTPUT = unknown>(impl: WorkflowStep<INPUT, OUTPUT, WorkflowContext<InferEngineSteps<ENGINE>>>) => { }
  };
}
