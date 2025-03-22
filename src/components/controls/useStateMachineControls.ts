import { useState, useEffect } from "react";
import {
  Rive,
  StateMachineInput,
  StateMachineInputType,
} from "@rive-app/react-canvas";
import { StateMachineInputs, StateMachineValues, ControlType } from "./types";

export function useStateMachineControls(
  rive: Rive | null,
  stateMachine: string
) {
  const [hasControls, setHasControls] = useState(false);
  const [activeTab, setActiveTab] = useState<ControlType>("booleans");
  const [inputs, setInputs] = useState<StateMachineInputs>({
    booleans: [],
    numbers: [],
    triggers: [],
  });
  const [values, setValues] = useState<StateMachineValues>({
    booleans: {},
    numbers: {},
  });

  // Reset state when animation changes
  useEffect(() => {
    setInputs({ booleans: [], numbers: [], triggers: [] });
    setValues({ booleans: {}, numbers: {} });
    setHasControls(false);
    setActiveTab("booleans");
  }, [stateMachine]);

  useEffect(() => {
    if (!rive || !stateMachine) {
      setHasControls(false);
      return;
    }

    try {
      const stateMachineInputs = rive.stateMachineInputs(stateMachine);
      if (!stateMachineInputs || Object.keys(stateMachineInputs).length === 0) {
        setHasControls(false);
        return;
      }

      const newInputs: StateMachineInputs = {
        booleans: [],
        numbers: [],
        triggers: [],
      };
      const newValues: StateMachineValues = {
        booleans: {},
        numbers: {},
      };

      Object.values(stateMachineInputs).forEach((input: StateMachineInput) => {
        const name = input.name;
        if (!name) return;

        switch (input.type) {
          case StateMachineInputType.Boolean:
            newInputs.booleans.push(input);
            newValues.booleans[name] = Boolean(input.value ?? false);
            break;
          case StateMachineInputType.Number:
            newInputs.numbers.push(input);
            newValues.numbers[name] = Number(input.value ?? 0);
            break;
          case StateMachineInputType.Trigger:
            newInputs.triggers.push(input);
            break;
        }
      });

      setInputs(newInputs);
      setValues(newValues);
      setHasControls(
        newInputs.booleans.length > 0 ||
          newInputs.numbers.length > 0 ||
          newInputs.triggers.length > 0
      );

      // Set initial active tab
      if (newInputs.booleans.length > 0) setActiveTab("booleans");
      else if (newInputs.numbers.length > 0) setActiveTab("numbers");
      else if (newInputs.triggers.length > 0) setActiveTab("triggers");
    } catch (err) {
      console.error("Error initializing state machine controls:", err);
      setHasControls(false);
    }
  }, [rive, stateMachine]);

  const updateBooleanValue = (name: string, value: boolean) => {
    try {
      const input = inputs.booleans.find((i) => i.name === name);
      if (input && typeof input.value !== "undefined") {
        input.value = value;
        setValues((prev) => ({
          ...prev,
          booleans: { ...prev.booleans, [name]: value },
        }));
      }
    } catch (err) {
      console.warn("Error setting boolean value:", err);
    }
  };

  const updateNumberValue = (name: string, value: number) => {
    try {
      const input = inputs.numbers.find((i) => i.name === name);
      if (input && typeof input.value !== "undefined") {
        input.value = value;
        setValues((prev) => ({
          ...prev,
          numbers: { ...prev.numbers, [name]: value },
        }));
      }
    } catch (err) {
      console.warn("Error updating number input:", err);
    }
  };

  const fireTrigger = (name: string) => {
    try {
      const input = inputs.triggers.find((i) => i.name === name);
      if (input?.fire && typeof input.fire === "function") {
        input.fire();
      }
    } catch (err) {
      console.warn("Error firing trigger:", err);
    }
  };

  return {
    hasControls,
    activeTab,
    setActiveTab,
    inputs,
    values,
    updateBooleanValue,
    updateNumberValue,
    fireTrigger,
  };
}
