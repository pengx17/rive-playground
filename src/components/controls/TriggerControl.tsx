import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StateMachineInput } from "@rive-app/react-canvas";

interface TriggerControlProps {
  input: StateMachineInput;
  onTrigger: () => void;
}

export function TriggerControl({ input, onTrigger }: TriggerControlProps) {
  const name = input.name;
  if (!name) return null;

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`trigger-${name}`}>{name}</Label>
      <Button
        id={`trigger-${name}`}
        variant="outline"
        size="sm"
        onClick={onTrigger}
      >
        Trigger
      </Button>
    </div>
  );
}
