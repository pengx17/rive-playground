import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StateMachineInput, StateMachineInputType } from "@rive-app/canvas";

interface AsciiStructureProps {
  artboards: string[];
  animations: string[];
  stateMachines: string[];
  selectedArtboard: string;
  stateMachineInputs?: Record<string, StateMachineInput>;
}

export const AsciiStructure: FC<AsciiStructureProps> = ({
  artboards,
  animations,
  stateMachines,
  selectedArtboard,
  stateMachineInputs,
}) => {
  const determineInputType = (input: StateMachineInput): string => {
    if (!input) return "unknown";

    switch (input.type) {
      case StateMachineInputType.Boolean:
        return "boolean";
      case StateMachineInputType.Number:
        return "number";
      case StateMachineInputType.Trigger:
        return "trigger";
      default:
        return "unknown";
    }
  };

  const getInputValue = (input: StateMachineInput): string => {
    if (!input || typeof input !== "object") return "";

    try {
      if (input.type === StateMachineInputType.Trigger) {
        return "";
      }

      // Check if the input has a value property and it's not null
      if (
        !("value" in input) ||
        input.value === null ||
        input.value === undefined
      ) {
        return "";
      }

      // Safely get the value
      const value = input.value;
      if (typeof value === "undefined" || value === null) {
        return "";
      }

      return ` (${value})`;
    } catch (err) {
      console.warn(`[DEBUG] Error getting input value:`, err);
      return "";
    }
  };

  const generateAsciiTree = () => {
    let ascii = "rive-file\n";

    // Add artboards
    artboards.forEach((artboard, index) => {
      const isLast = index === artboards.length - 1;
      const prefix = isLast ? "└── " : "├── ";
      const isSelected = artboard === selectedArtboard;

      ascii += `${prefix}${isSelected ? "* " : ""}artboard: ${artboard}\n`;

      // Only show animations and state machines for the selected artboard
      if (isSelected) {
        const childPrefix = isLast ? "    " : "│   ";

        // Add animations
        if (animations.length > 0) {
          ascii += `${childPrefix}├── animations\n`;
          animations.forEach((animation, animIndex) => {
            const isAnimLast = animIndex === animations.length - 1;
            const animPrefix = isAnimLast ? "└── " : "├── ";
            ascii += `${childPrefix}│   ${animPrefix}${animation}\n`;
          });
        }

        // Add state machines
        if (stateMachines.length > 0) {
          ascii += `${childPrefix}${animations.length > 0 ? "└── " : "├── "}state-machines\n`;
          stateMachines.forEach((stateMachine, smIndex) => {
            const isSmLast = smIndex === stateMachines.length - 1;
            const smPrefix = isSmLast ? "└── " : "├── ";
            ascii += `${childPrefix}    ${smPrefix}${stateMachine}\n`;

            // Add state machine inputs if available
            if (stateMachineInputs && typeof stateMachineInputs === "object") {
              const inputItems = Object.entries(stateMachineInputs).filter(
                ([, input]) =>
                  input != null && typeof input === "object" && "type" in input
              );

              if (inputItems.length > 0) {
                ascii += `${childPrefix}    ${isSmLast ? "    " : "│   "}└── inputs\n`;
                inputItems.forEach(([name, input], inputIndex) => {
                  if (!input || typeof input !== "object" || !("type" in input))
                    return;

                  const isInputLast = inputIndex === inputItems.length - 1;
                  const inputItemPrefix = isInputLast ? "└── " : "├── ";
                  const inputType = determineInputType(input);
                  const inputValue = getInputValue(input);

                  ascii += `${childPrefix}    ${isSmLast ? "    " : "│   "}${isInputLast ? "    " : "│   "}${inputItemPrefix}${name}: ${inputType}${inputValue}\n`;
                });
              }
            }
          });
        }
      }
    });

    return ascii;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ASCII File Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="font-mono text-sm overflow-x-auto">
          {generateAsciiTree()}
        </pre>
      </CardContent>
    </Card>
  );
};
