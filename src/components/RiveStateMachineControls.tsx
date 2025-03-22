import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rive } from "@rive-app/react-canvas";
import { BooleanControl } from "./controls/BooleanControl";
import { NumberControl } from "./controls/NumberControl";
import { TriggerControl } from "./controls/TriggerControl";
import { useStateMachineControls } from "./controls/useStateMachineControls";
import { ControlType } from "./controls/types";

interface RiveStateMachineControlsProps {
  rive: Rive;
  stateMachine: string;
}

export default function RiveStateMachineControls({
  rive,
  stateMachine,
}: RiveStateMachineControlsProps) {
  const {
    hasControls,
    activeTab,
    setActiveTab,
    inputs,
    values,
    updateBooleanValue,
    updateNumberValue,
    fireTrigger,
  } = useStateMachineControls(rive, stateMachine);

  if (!hasControls) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>State Machine Controls</CardTitle>
        <p className="text-sm text-muted-foreground">
          Interact with the state machine "{stateMachine}".
        </p>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ControlType)}
        >
          <TabsList className="w-full">
            {inputs.booleans.length > 0 && (
              <TabsTrigger value="booleans">Booleans</TabsTrigger>
            )}
            {inputs.numbers.length > 0 && (
              <TabsTrigger value="numbers">Numbers</TabsTrigger>
            )}
            {inputs.triggers.length > 0 && (
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
            )}
          </TabsList>

          {inputs.booleans.length > 0 && (
            <TabsContent value="booleans" className="mt-4 space-y-4">
              {inputs.booleans.map((input) => (
                <BooleanControl
                  key={input.name}
                  input={input}
                  value={values.booleans[input.name] ?? false}
                  onChange={(checked) =>
                    updateBooleanValue(input.name, checked)
                  }
                />
              ))}
            </TabsContent>
          )}

          {inputs.numbers.length > 0 && (
            <TabsContent value="numbers" className="mt-4 space-y-6">
              {inputs.numbers.map((input) => (
                <NumberControl
                  key={input.name}
                  input={input}
                  value={values.numbers[input.name] ?? 0}
                  onChange={(newValue) =>
                    updateNumberValue(input.name, newValue)
                  }
                />
              ))}
            </TabsContent>
          )}

          {inputs.triggers.length > 0 && (
            <TabsContent value="triggers" className="mt-4 space-y-4">
              {inputs.triggers.map((input) => (
                <TriggerControl
                  key={input.name}
                  input={input}
                  onTrigger={() => fireTrigger(input.name)}
                />
              ))}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
