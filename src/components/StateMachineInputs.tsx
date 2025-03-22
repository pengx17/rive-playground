import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

// Rive input types (from Rive documentation)
export enum RiveInputType {
  Number = 0,
  Boolean = 1,
  Trigger = 2,
}

interface RiveStateMachineInput {
  name: string;
  type: RiveInputType;
  value?: boolean | number;
}

interface StateMachineInputsProps {
  inputs: RiveStateMachineInput[];
  onInputChange: (name: string, value: boolean | number) => void;
  onTrigger: (name: string) => void;
}

export function StateMachineInputs({
  inputs,
  onInputChange,
  onTrigger,
}: StateMachineInputsProps) {
  // Group inputs by type
  const booleanInputs = inputs.filter(
    (input) => input.type === RiveInputType.Boolean
  );
  const numberInputs = inputs.filter(
    (input) => input.type === RiveInputType.Number
  );
  const triggerInputs = inputs.filter(
    (input) => input.type === RiveInputType.Trigger
  );

  // Only show the tabs with content
  const hasBooleans = booleanInputs.length > 0;
  const hasNumbers = numberInputs.length > 0;
  const hasTriggers = triggerInputs.length > 0;

  // Default tab selection logic
  const getDefaultTab = useCallback(() => {
    if (hasBooleans) return "booleans";
    if (hasNumbers) return "numbers";
    if (hasTriggers) return "triggers";
    return "booleans"; // Fallback
  }, [hasBooleans, hasNumbers, hasTriggers]);

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update active tab when inputs change
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [getDefaultTab, inputs]);

  if (inputs.length === 0) {
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
              {booleanInputs.map((input) => (
                <div
                  key={input.name}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={`boolean-${input.name}`}>{input.name}</Label>
                  <Switch
                    id={`boolean-${input.name}`}
                    checked={Boolean(input.value)}
                    onCheckedChange={(checked) =>
                      onInputChange(input.name, checked)
                    }
                  />
                </div>
              ))}
            </TabsContent>
          )}

          {hasNumbers && (
            <TabsContent value="numbers" className="mt-4 space-y-6">
              {numberInputs.map((input) => (
                <div key={input.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`number-${input.name}`}>{input.name}</Label>
                    <span className="text-sm font-medium">
                      {(input.value as number)?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <Slider
                    id={`number-${input.name}`}
                    min={0}
                    max={100}
                    step={1}
                    value={[Number(input.value) || 0]}
                    onValueChange={(values) =>
                      onInputChange(input.name, values[0])
                    }
                  />
                </div>
              ))}
            </TabsContent>
          )}

          {hasTriggers && (
            <TabsContent value="triggers" className="mt-4 space-y-4">
              {triggerInputs.map((input) => (
                <div
                  key={input.name}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={`trigger-${input.name}`}>{input.name}</Label>
                  <Button
                    id={`trigger-${input.name}`}
                    variant="outline"
                    size="sm"
                    onClick={() => onTrigger(input.name)}
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
