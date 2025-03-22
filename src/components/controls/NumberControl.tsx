import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { StateMachineInput } from "@rive-app/react-canvas";

interface NumberControlProps {
  input: StateMachineInput;
  value: number;
  onChange: (value: number) => void;
}

export function NumberControl({ input, value, onChange }: NumberControlProps) {
  const name = input.name;
  if (!name) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={`number-${name}`}>{name}</Label>
        <span className="text-sm font-medium">{value.toFixed(2)}</span>
      </div>
      <Slider
        id={`number-${name}`}
        min={0}
        max={100}
        step={1}
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
      />
    </div>
  );
}
