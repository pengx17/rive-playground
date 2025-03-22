import { StateMachineInput } from "@rive-app/react-canvas";

export interface StateMachineInputs {
  booleans: StateMachineInput[];
  numbers: StateMachineInput[];
  triggers: StateMachineInput[];
}

export interface StateMachineValues {
  booleans: Record<string, boolean>;
  numbers: Record<string, number>;
}

export type ControlType = "booleans" | "numbers" | "triggers";
