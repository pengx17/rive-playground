import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StateMachineInput } from "@rive-app/react-canvas";

interface BooleanControlProps {
  input: StateMachineInput;
  value: boolean;
  onChange: (checked: boolean) => void;
}

export function BooleanControl({
  input,
  value,
  onChange,
}: BooleanControlProps) {
  const name = input.name;
  if (!name) return null;

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`boolean-${name}`}>{name}</Label>
      <Switch
        id={`boolean-${name}`}
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  );
}
