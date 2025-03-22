import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Define minimal interface for Rive
interface RiveStateMachineInput {
  value?: boolean | number;
  fire?: () => void;
}

interface RiveInstance {
  stateMachineInputs: (
    stateMachineName: string
  ) => Record<string, RiveStateMachineInput>;
}

interface InputItem {
  name: string;
  input: RiveStateMachineInput;
}

interface StateControlsProps {
  rive: RiveInstance | null;
  stateMachine: string;
  inputs?: RiveStateMachineInput[];
}

export function StateControls({
  rive,
  stateMachine,
  inputs,
}: StateControlsProps) {
  const [booleanInputs, setBooleanInputs] = useState<InputItem[]>([]);
  const [numberInputs, setNumberInputs] = useState<InputItem[]>([]);
  const [triggerInputs, setTriggerInputs] = useState<InputItem[]>([]);
  const [activeTab, setActiveTab] = useState("booleans");

  // Process inputs when they change
  useEffect(() => {
    if (!rive || !stateMachine) return;

    try {
      // Get inputs from Rive state machine
      const smInputs = rive.stateMachineInputs(stateMachine);
      if (!smInputs) return;

      console.log("Raw state machine inputs:", smInputs);

      const booleans: InputItem[] = [];
      const numbers: InputItem[] = [];
      const triggers: InputItem[] = [];

      // Loop through all inputs and categorize them
      Object.keys(smInputs).forEach((name) => {
        const input = smInputs[name];
        if (!input) return;

        if (typeof input.value === "boolean") {
          booleans.push({ name, input });
        } else if (typeof input.value === "number") {
          numbers.push({ name, input });
        } else if (input.fire && typeof input.fire === "function") {
          triggers.push({ name, input });
        }
      });

      setBooleanInputs(booleans);
      setNumberInputs(numbers);
      setTriggerInputs(triggers);

      // Set default active tab
      if (booleans.length > 0) {
        setActiveTab("booleans");
      } else if (numbers.length > 0) {
        setActiveTab("numbers");
      } else if (triggers.length > 0) {
        setActiveTab("triggers");
      }
    } catch (error) {
      console.error("Error processing state machine inputs:", error);
    }
  }, [rive, stateMachine, inputs]);

  // Handlers
  const handleBooleanChange = (
    input: RiveStateMachineInput,
    checked: boolean
  ) => {
    if (input && typeof input.value !== "undefined") {
      input.value = checked;
    }
  };

  const handleNumberChange = (input: RiveStateMachineInput, value: number) => {
    if (input && typeof input.value !== "undefined") {
      input.value = value;
    }
  };

  const handleTrigger = (input: RiveStateMachineInput) => {
    if (input && input.fire && typeof input.fire === "function") {
      input.fire();
    }
  };

  const hasBooleans = booleanInputs.length > 0;
  const hasNumbers = numberInputs.length > 0;
  const hasTriggers = triggerInputs.length > 0;

  if (!hasBooleans && !hasNumbers && !hasTriggers) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Controls</CardTitle>
        <p className="text-sm text-muted-foreground">
          Interact with the animation.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            {hasBooleans && (
              <TabsTrigger value="booleans">Booleans</TabsTrigger>
            )}
            {hasNumbers && <TabsTrigger value="numbers">Numbers</TabsTrigger>}
            {hasTriggers && (
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
            )}
          </TabsList>

          {hasBooleans && (
            <TabsContent value="booleans" className="mt-4 space-y-4">
              {booleanInputs.map(({ name, input }) => (
                <div key={name} className="flex items-center justify-between">
                  <Label htmlFor={`boolean-${name}`}>{name}</Label>
                  <Switch
                    id={`boolean-${name}`}
                    checked={Boolean(input.value)}
                    onCheckedChange={(checked) =>
                      handleBooleanChange(input, checked)
                    }
                  />
                </div>
              ))}
            </TabsContent>
          )}

          {hasNumbers && (
            <TabsContent value="numbers" className="mt-4 space-y-6">
              {numberInputs.map(({ name, input }) => (
                <div key={name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`number-${name}`}>{name}</Label>
                    <span className="text-sm font-medium">
                      {Number(input.value).toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    id={`number-${name}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[Number(input.value) || 0]}
                    onValueChange={(values) =>
                      handleNumberChange(input, values[0])
                    }
                  />
                </div>
              ))}
            </TabsContent>
          )}

          {hasTriggers && (
            <TabsContent value="triggers" className="mt-4 space-y-4">
              {triggerInputs.map(({ name, input }) => (
                <div key={name} className="flex items-center justify-between">
                  <Label htmlFor={`trigger-${name}`}>{name}</Label>
                  <Button
                    id={`trigger-${name}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTrigger(input)}
                  >
                    Trigger
                  </Button>
                </div>
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
