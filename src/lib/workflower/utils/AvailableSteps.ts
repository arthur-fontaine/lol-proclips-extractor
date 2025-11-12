import type { AnyWorkflowStep } from "../WorkflowStep.ts";

export type AvailableSteps<STEPS extends AnyWorkflowStep[]> = STEPS[number];
