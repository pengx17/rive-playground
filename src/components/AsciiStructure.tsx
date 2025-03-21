import { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AsciiStructureProps {
  artboards: string[];
  animations: string[];
  stateMachines: string[];
  selectedArtboard: string;
}

export const AsciiStructure: FC<AsciiStructureProps> = ({
  artboards,
  animations,
  stateMachines,
  selectedArtboard,
}) => {
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
