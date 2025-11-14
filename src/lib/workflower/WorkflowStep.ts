import type { WorkflowContext } from "./WorkflowContext.ts";

export abstract class WorkflowStep<INPUT, OUTPUT, CTX extends WorkflowContext<AnyWorkflowStep[]>> {
  config?: {
    concurrency?: number;
    hideLogging?: boolean;
  } | undefined;

  abstract execute(input: INPUT, ctx: CTX): AsyncGenerator<OUTPUT>;
}

export type AnyWorkflowStep = WorkflowStep<any, any, any>;
export type InferWorkflowStepInput<STEP extends AnyWorkflowStep> = STEP extends WorkflowStep<infer INPUT, any, any> ? INPUT : never;
export type InferWorkflowStepOutput<STEP extends AnyWorkflowStep> = STEP extends WorkflowStep<any, infer OUTPUT, any> ? OUTPUT : never;

export function createWorkflowStep<INPUT = undefined, OUTPUT = unknown, CTX extends WorkflowContext<AnyWorkflowStep[]> = WorkflowContext<AnyWorkflowStep[]>>(impl: WorkflowStep<INPUT, OUTPUT, CTX> & { name?: string }) {
  const cl = class extends WorkflowStep<INPUT, OUTPUT, CTX> {
    override config = impl.config;
    async *execute(input: INPUT, ctx: CTX): AsyncGenerator<OUTPUT> {
      yield* impl.execute(input, ctx);
    }
  };
  if (impl.name) {
    Object.defineProperty(cl, 'name', { value: impl.name });
  }
  return new cl();
}
