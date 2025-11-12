import pLimit, { type LimitFunction } from "p-limit";
import type { AvailableSteps } from "./utils/AvailableSteps.ts";
import type { InferEngineSteps, WorkflowEngine } from "./WorkflowEngine.ts";
import { type AnyWorkflowStep, type InferWorkflowStepInput, type InferWorkflowStepOutput, type WorkflowStep } from "./WorkflowStep.ts";

export class WorkflowContext<const STEPS extends AnyWorkflowStep[] = []> {
  private engine: WorkflowEngine<STEPS>;
  // private valueHistory = new Map<AnyWorkflowStep, unknown[]>();
  private stepLimits = new Map<AnyWorkflowStep, LimitFunction>();

  constructor(engine: WorkflowEngine<STEPS>) {
    this.engine = engine;
  }

  private getStepLimit(step: AnyWorkflowStep): LimitFunction {
    let limit = this.stepLimits.get(step);
    if (!limit) {
      // @ts-expect-error `concurrency` is private
      const concurrency = this.engine.concurrency;
      limit = typeof concurrency === 'number' ? pLimit(concurrency) : concurrency;
      this.stepLimits.set(step, limit);
    }
    return limit;
  }

  private async run<STEP extends AvailableSteps<STEPS>>(step: STEP, input: InferWorkflowStepInput<STEP>) {
    console.log(`Running step: ${step.constructor.name}`);
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
  }
}

export const createWorkflowContext = <ENGINE extends WorkflowEngine<any[]>>() => {
  return {
    new: (engine: ENGINE) => new WorkflowContext(engine),
    step: <INPUT = undefined, OUTPUT = unknown>(impl: WorkflowStep<INPUT, OUTPUT, WorkflowContext<InferEngineSteps<ENGINE>>>) => { }
  };
}
