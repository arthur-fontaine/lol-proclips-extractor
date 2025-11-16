import type { WorkflowContext } from "./WorkflowContext.ts";

export abstract class WorkflowStep<INPUT, OUTPUT, CTX extends WorkflowContext<AnyWorkflowStep[]>> {
  config?: {
    concurrency?: number;
    retryCount?: number;
    hideLogging?: boolean;
  } | undefined;

  abstract execute(input: INPUT, ctx: CTX): AsyncGenerator<OUTPUT>;
}

// biome-ignore lint/suspicious/noExplicitAny: Utility alias needs to accept any workflow step
export type AnyWorkflowStep = WorkflowStep<any, any, any>;
// biome-ignore lint/suspicious/noExplicitAny: Utility conditional types require any fallbacks
export type InferWorkflowStepInput<STEP extends AnyWorkflowStep> = STEP extends WorkflowStep<infer INPUT, any, any> ? INPUT : never;
// biome-ignore lint/suspicious/noExplicitAny: Utility conditional types require any fallbacks
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
