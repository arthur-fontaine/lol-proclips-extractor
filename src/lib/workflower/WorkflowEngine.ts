import type { LimitFunction } from "p-limit";
import type { AvailableSteps } from "./utils/AvailableSteps.ts";
import { WorkflowContext } from "./WorkflowContext.ts";
import type { AnyWorkflowStep, InferWorkflowStepInput, InferWorkflowStepOutput, WorkflowStep } from "./WorkflowStep.ts";

export class WorkflowEngine<const STEPS extends AnyWorkflowStep[] = []> {
  steps: STEPS = [] as unknown as STEPS;
  flows: Map<AnyWorkflowStep, AnyWorkflowStep[]> = new Map();

  private concurrency: number | LimitFunction;

  constructor(concurrency: number | LimitFunction = 10) {
    this.concurrency = concurrency;
  }

  addStep<NEW_STEP extends AnyWorkflowStep>(
    step: NEW_STEP,
    then: WorkflowStep<InferWorkflowStepOutput<NEW_STEP>, any, any>[] = []
  ): WorkflowEngine<[...STEPS, NEW_STEP]> {
    this.steps.push(step);
    this.flows.set(step, then);
    return this as unknown as WorkflowEngine<[...STEPS, NEW_STEP]>;
  }

  async run<STEP extends AvailableSteps<STEPS>>(step: STEP, input: InferWorkflowStepInput<STEP>) {
    const context = new WorkflowContext(this);
    context['startLogging']();
    return await context['run'](step, input);
  }
}

export function createWorkflowEngine(concurrency: number | LimitFunction = 10) {
  return new WorkflowEngine(concurrency);
}

export type InferEngineSteps<ENGINE extends WorkflowEngine<any[]>> = ENGINE extends WorkflowEngine<infer STEPS> ? STEPS : never;
